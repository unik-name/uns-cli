import { Interfaces } from "@uns/ark-crypto";
import {
    buildDiscloseDemand,
    DIDHelpers,
    DIDType,
    FingerprintResult,
    IDiscloseDemand,
    IDiscloseDemandCertification,
} from "@uns/ts-sdk";
import { cli } from "cli-ux";
import { CryptoAccountPassphrases } from "types";
import { BaseCommand } from "../../baseCommand";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../../formater";
import { checkFlag, createDiscloseTransaction, explicitValueFlag, getTargetArg, isDid } from "../../utils";
import { WriteCommand } from "../../writeCommand";

export class UnikDiscloseCommand extends WriteCommand {
    public static description = "Disclose one or multiple explicitValues of your UNIK identifier.";

    public static usage: string | string[] | undefined = 'unik:disclose TARGET -e "explicitValueToDisclose"';

    public static examples = ["$ uns unik:disclose @bob -e bob"];

    public static flags = {
        ...WriteCommand.getWriteCommandFlags(false),
        ...explicitValueFlag("Explicit value to disclose.", true),
        ...checkFlag(
            "Check if user knows that his @unikname will be disclosed forever. (--no-check to bypass this check)",
        ),
    };

    public static args = [getTargetArg()];

    public async formatResult(transactionFromNetwork: any, transactionId: string) {
        /**
         * Result prompt
         */
        if (transactionFromNetwork) {
            if (transactionFromNetwork.confirmations) {
                this.info("Transaction confirmed by the network.");
            }
        } else {
            this.error(
                `Transaction not found yet, the network can be slow. Check this url in a while: ${this.getTransactionUrl(
                    transactionId,
                )}`,
            );
        }
        return {
            data: {
                transaction: transactionFromNetwork.id,
                confirmations: transactionFromNetwork.confirmations,
            },
        };
    }

    public getTransactionUrl(transactionId: string): string {
        return `${this.unsClientWrapper.getExplorerUrl()}/transaction/${transactionId}`;
    }

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return UnikDiscloseCommand;
    }

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<NestedCommandOutput> {
        let explicitValues: string[] = flags.explicitValue;
        if (!explicitValues) {
            if (isDid(args.target)) {
                const explicitValue = args.target.split(":").pop();
                explicitValues = [explicitValue];
            } else {
                throw new Error("Please provide an explicitValue through --explicitValue flag");
            }
        }

        const { unikid } = await this.targetResolve(flags, args.target);

        if (flags.check) {
            const confirmation = await cli.confirm(
                "Disclosing a @unikname to the network can't be cancelled nor revoked. Your ID will be disclosed forever. Do you confirm the disclose demand? [y/n]",
            );

            if (!confirmation) {
                this.exit(0); // Normal exit
            }
        }

        const unikType = await this.getUnikType(unikid);

        // Remove duplicates explicits
        explicitValues = [...new Set(explicitValues)] as string[];

        await this.checkExplicitValues(unikid, unikType, explicitValues);

        const passphrases: CryptoAccountPassphrases = await this.askForPassphrases(flags);

        const transactionStruct: Interfaces.ITransactionData = await this.createTransactionStruct(
            flags,
            unikid,
            explicitValues,
            unikType,
            passphrases.first,
            passphrases.second,
        );

        const transactionFromNetwork = await this.sendAndWaitConfirmationsIfNeeded(
            transactionStruct,
            flags["await-confirmation"],
        );

        return await this.formatResult(transactionFromNetwork, transactionStruct.id as string);
    }

    private async checkExplicitValues(
        unikId: string,
        unikType: DIDType,
        listOfExplicitValues: string[],
    ): Promise<void> {
        // Check explicit values
        let hasTDLExplicitValue: boolean = false;
        for (const explicit of listOfExplicitValues) {
            try {
                const fingerPrintResult: FingerprintResult = await this.unsClientWrapper.computeTokenId(
                    explicit,
                    unikType,
                    "UNIK",
                    true,
                );
                if (fingerPrintResult.fingerprint !== unikId) {
                    throw new Error("At least one expliciteValue is not valid for this unikid");
                }
                if (fingerPrintResult.computingInformations?.isEndingWithTLDWithDot) {
                    hasTDLExplicitValue = true;
                }
            } catch (e) {
                this.debug(`disclose-explicit-values - ${e.message}`);
                throw new Error("At least one expliciteValue does not match expected format");
            }
        }

        if (hasTDLExplicitValue && unikType !== "INDIVIDUAL") {
            const userConsent: boolean = await this.warnUserAndGetConsent(
                `${
                    listOfExplicitValues.length > 1 ? "At least one @uniknameID of your list" : "This @uniknameID"
                } seems to look like a domain name. We recommend to create @unikname without extension`,
            );

            if (!userConsent) {
                this.exit(0); // Normal exit
            }
        }

        this.info("ExpliciteValues valid for this unikid");
    }

    private async createTransactionStruct(
        flags: Record<string, any>,
        unikid: string,
        explicitValues: string[],
        unikType: DIDType,
        passphrase: string,
        secondPassphrase: string,
    ): Promise<any | string> {
        // Create Disclose Demand
        const discloseDemand: IDiscloseDemand = buildDiscloseDemand(
            unikid,
            explicitValues,
            DIDHelpers.fromLabel(unikType),
            passphrase,
        );

        const discloseDemandCertification: IDiscloseDemandCertification = await this.unsClientWrapper.getDiscloseDemandCertification(
            discloseDemand,
        );

        /**
         * Read emitter's wallet nonce
         */
        const nonce = await this.getNextWalletNonceFromPassphrase(passphrase);

        /**
         * Transaction creation
         */
        return await this.createTransaction(
            discloseDemand,
            discloseDemandCertification,
            flags.fee,
            nonce,
            passphrase,
            secondPassphrase,
        );
    }

    private async createTransaction(
        discloseDemand: IDiscloseDemand,
        discloseDemandCertification: IDiscloseDemandCertification,
        fees: number,
        nonce: string,
        passphrase: string,
        secondPassphrase?: string,
    ): Promise<Interfaces.ITransactionData> {
        const todo = () => {
            return createDiscloseTransaction(
                discloseDemand,
                discloseDemandCertification,
                fees,
                nonce,
                passphrase,
                secondPassphrase,
            );
        };
        return await this.withAction<Interfaces.ITransactionData>("Creating transaction", todo);
    }
}
