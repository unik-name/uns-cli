import { Interfaces } from "@uns/ark-crypto";
import {
    buildDiscloseDemand,
    DIDHelpers,
    DIDType,
    IDiscloseDemand,
    IDiscloseDemandCertification,
    ResponseWithChainMeta,
} from "@uns/ts-sdk";
import { cli } from "cli-ux";
import { CryptoAccountPassphrases } from "types";
import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { checkUnikIdFormat, createDiscloseTransaction, explicitValueFlag, unikidFlag } from "../../utils";
import { WriteCommand } from "../../writeCommand";

export class UnikDiscloseCommand extends WriteCommand {
    public static description = "Disclose one or multiple explicitValues of your UNIK identifier.";

    public static examples = [
        `$ uns unik:disclose --unikid 636795fff13c8f2d2fd90f9aa124d7f583920fce83588895c917927ee522db3b -e bob -e b0b --network sandbox`,
    ];

    public static flags = {
        ...WriteCommand.getWriteCommandFlags(),
        ...unikidFlag("The UNIK token on which to disclose values"),
        ...explicitValueFlag("Explicit value to disclose.", true),
    };

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

    protected async do(flags: Record<string, any>): Promise<any> {
        await this.checkUnik(flags.unikid);

        const passphrases: CryptoAccountPassphrases = await this.askForPassphrases(flags);

        const confirmation = await cli.confirm(
            "Disclosing a @unik-name to the network can't be cancelled nor revoked. Your ID will be disclosed forever. Do you confirm the disclose demand? [y/n]",
        );

        if (!confirmation) {
            return "Command aborted by user";
        }

        const unikType = await this.getUnikType(flags.unikid);

        // Remove duplicates explicits
        const explicitValues = [...new Set(flags.explicitValue)] as string[];
        await this.checkExplicitValues(flags.unikid, unikType, explicitValues);

        const transactionStruct: Interfaces.ITransactionData = await this.createTransactionStruct(
            flags,
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

    private async checkUnik(unikId: string) {
        // Check unikid format
        checkUnikIdFormat(unikId);

        try {
            await this.unsClientWrapper.getUnikById(unikId);
        } catch (e) {
            throw new Error("unikid is not valid");
        }
    }

    private async getUnikType(unikId: string): Promise<DIDType> {
        // get unik type
        const unikTypeResponse: ResponseWithChainMeta<string> = (await this.unsClientWrapper.getUnikProperty(
            unikId,
            "type",
            false,
        )) as ResponseWithChainMeta<string>;
        let unikType: string;

        if (unikTypeResponse.error) {
            throw new Error(`Unable to get UNIK type (id: ${unikId}). Caused by ${unikTypeResponse.error?.message}`);
        } else {
            unikType = unikTypeResponse.data as string;
        }

        const type: number = Number.parseInt(unikType);

        const didType = DIDHelpers.fromCode(type);

        if (!didType) {
            throw new Error("Unknown UNIK type");
        }

        return didType;
    }

    private async checkExplicitValues(unikId: string, unikType: DIDType, listOfExplicitValues: string[]) {
        // Check explicit values
        for (const explicit of listOfExplicitValues) {
            try {
                const fingerPrintResult = await this.unsClientWrapper.computeTokenId(explicit, unikType, "UNIK");
                if (fingerPrintResult !== unikId) {
                    throw new Error("At least one expliciteValue is not valid for this unikid");
                }
            } catch (e) {
                this.debug(`disclose-explicit-values - ${e.message}`);
                throw new Error("At least one expliciteValue does not match expected format");
            }
        }

        this.info("ExpliciteValues valid for this unikid");
    }

    private async createTransactionStruct(
        flags: Record<string, any>,
        explicitValues: string[],
        unikType: DIDType,
        passphrase: string,
        secondPassphrase: string,
    ): Promise<any | string> {
        // Create Disclose Demand
        const discloseDemand: IDiscloseDemand = buildDiscloseDemand(
            flags.unikid,
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
