import { flags } from "@oclif/command";
import { Interfaces, Managers } from "@uns/ark-crypto";
import {
    createCertifiedNftMintTransaction,
    DIDHelpers,
    DIDType,
    DIDTypes,
    FingerprintResult,
    isError,
    SdkResult,
} from "@uns/ts-sdk";
import { BaseCommand } from "../../baseCommand";
import { EXPLICIT_VALUE_MAX_LENGTH } from "../../config";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../../formater";
import { CryptoAccountPassphrases, getUnikTypesList } from "../../types";
import { certificationFlag, isDevMode, NFT_NAME, DEFAULT_COMMAND_FEES } from "../../utils";
import { WriteCommand } from "../../writeCommand";

export class UnikCreateCommand extends WriteCommand {
    public static description = "Create UNIKNAME token";

    public static usage = "unik:create --explicitValue {explicitValue} --type {type}";

    public static examples = [
        `$ unikname unik:create --explicitValue {explicitValue} --type [${getUnikTypesList().join(
            "|",
        )}] --coupon {coupon}`,
    ];

    public static flags = {
        ...UnikCreateCommand.getFlags(),
    };

    protected static getFlags() {
        const unikFlags = {
            ...WriteCommand.getWriteCommandFlags(true, 0),
            explicitValue: flags.string({ description: "UNIKNAME nft token explicit value", required: true }),
            type: flags.string({
                description: "UNIKNAME nft type",
                required: true,
                options: getUnikTypesList(),
            }),
            ["unik-voucher"]: flags.string({
                char: "u",
                description: "Voucher for @unikname creation",
                required: false,
                exclusive: ["fee"],
            }),
            coupon: flags.string({
                char: "c",
                description: "Coupon code for @unikname creation",
                required: false,
                exclusive: ["unik-voucher"],
            }),
        };

        if (isDevMode()) {
            Object.assign(unikFlags, certificationFlag());
        }

        return unikFlags;
    }

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return UnikCreateCommand;
    }

    protected async do(flags: Record<string, any>): Promise<NestedCommandOutput> {
        const explicitValue: string = flags.explicitValue;
        const didType: DIDType = flags.type.toUpperCase();
        if (explicitValue.length > EXPLICIT_VALUE_MAX_LENGTH) {
            throw new Error(
                `Error computing  UNIKNAME id. Too long explicitValue ([${explicitValue.length}] max length: ${EXPLICIT_VALUE_MAX_LENGTH})`,
            );
        }

        /**
         * Compute Fingerprint
         */
        this.actionStart("Computing UNIKNAME fingerprint");
        const computeFingerprintResult: FingerprintResult = await this.unsClientWrapper.computeTokenId(
            explicitValue,
            didType,
            "UNIK",
            true,
        );
        this.actionStop();

        const tokenId: string = computeFingerprintResult.fingerprint;
        this.log(`unikid: ${tokenId}`);

        if (didType !== "INDIVIDUAL" && computeFingerprintResult.computingInformations?.isEndingWithTLD) {
            const userConsent: boolean = await this.warnUserAndGetConsent(
                "This @uniknameID seems to look like a domain name. We recommend to create @unikname without extension.",
            );
            if (!userConsent) {
                this.exit(0); // Normal exit
            }
        }

        const passphrases: CryptoAccountPassphrases = await this.askForPassphrases(flags);

        /**
         * Read emitter's wallet nonce
         */
        const nonce = await this.getNextWalletNonceFromPassphrase(passphrases.first);

        /**
         * Transaction creation
         */
        this.actionStart("Creating transaction");

        let voucher = flags["unik-voucher"];
        if (flags.coupon) {
            voucher = await this.unsClientWrapper.createUnikVoucher(explicitValue, didType, flags.coupon);
        }

        const defaultFees: number =
            DIDHelpers.fromLabel(didType) === DIDTypes.INDIVIDUAL
                ? 0
                : Managers.configManager.getMilestone().fees.staticFees?.UnsCertifiedNftMint || DEFAULT_COMMAND_FEES;

        let fee: number = defaultFees;
        if (flags.fee !== defaultFees) {
            if (this.isFlagSet("fee") && DIDHelpers.fromLabel(didType) !== DIDTypes.INDIVIDUAL) {
                if (voucher) {
                    throw new Error(
                        `Specified fee \"${flags.fee}\" does not respect fees policy. Fee for unik:create with coupon must be \"${defaultFees}\"`,
                    );
                }
                fee = flags.fee;
            }
        }

        const result: SdkResult<Interfaces.ITransactionData> = await createCertifiedNftMintTransaction(
            this.unsClientWrapper.unsClient,
            tokenId,
            `@${NFT_NAME}:${flags.type}:${flags.explicitValue}`,
            fee,
            nonce,
            passphrases.first,
            passphrases.second,
            voucher,
            this.getCertificationMode(flags),
        );
        this.actionStop();

        if (isError(result)) {
            throw new Error(`${result.message} ${result.code ? ` (${result.code})` : ""}`);
        }

        if (!result.id) {
            throw new Error("Transaction id can't be undefined");
        }

        this.log(`Transaction id: ${result.id}`);

        const transactionUrl = `${this.unsClientWrapper.getExplorerUrl()}/transaction/${result.id}`;
        this.log(`Transaction in explorer: ${transactionUrl}`);

        const transactionFromNetwork = await this.sendAndWaitConfirmationsIfNeeded(result, flags);

        /**
         * Result prompt
         */
        if (transactionFromNetwork) {
            this.log(
                `UNIKNAME nft forged:  ${transactionFromNetwork.confirmations} confirmation${
                    transactionFromNetwork.confirmations > 0 ? "s" : ""
                }`,
            );

            const tokenUrl = `${this.unsClientWrapper.getExplorerUrl()}/uniks/${tokenId}`;
            this.log(`UNIKNAME nft in Unikname explorer: ${tokenUrl}`);
        } else {
            this.error(
                `Transaction not found yet, the network can be slow. Check this url in a while: ${transactionUrl}`,
            );
        }
        return {
            data: {
                id: tokenId,
                transaction: result.id,
                confirmations: transactionFromNetwork.confirmations,
            },
        };
    }

    private getCertificationMode(flags: Record<string, any>): boolean {
        if (isDevMode()) {
            return !!flags.certification;
        }
        return true;
    }
}
