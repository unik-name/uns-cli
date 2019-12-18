import { Interfaces } from "@uns/ark-crypto";
import {
    buildDiscloseDemand,
    DIDHelpers,
    DIDType,
    IDiscloseDemand,
    IDiscloseDemandCertification,
    PropertyValue,
} from "@uns/ts-sdk";
import { cli } from "cli-ux";
import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import {
    checkUnikIdFormat,
    createDiscloseTransaction,
    explicitValueFlag,
    passphraseFlag,
    unikidFlag,
} from "../../utils";
import { WriteCommand } from "../../writeCommand";

export class UnikDiscloseCommand extends WriteCommand {
    public static description = "Disclose one or multiple explicitValues of your UNIK identifier.";

    public static examples = [
        `$ uns unik:disclose --unikid 636795fff13c8f2d2fd90f9aa124d7f583920fce83588895c917927ee522db3b -e bob b0b --network sandbox`,
    ];

    public static flags = {
        ...WriteCommand.getWriteCommandFlags(),
        ...passphraseFlag,
        ...unikidFlag("The UNIK token on which to disclose values"),
        ...explicitValueFlag("Array of explicit value to disclose, separated with a space.", true),
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
        return `${this.api.getExplorerUrl()}/transaction/${transactionId}`;
    }

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return UnikDiscloseCommand;
    }

    protected async do(flags: Record<string, any>): Promise<any> {
        await this.checkUnik(flags.unikid);

        const passphrases = await this.askForPassphrases(flags);

        const confirmation = await cli.confirm(
            "Disclosing a @unik-name to the network can't be cancelled nor revoked. Your ID will be disclosed forever. Do you confirm the disclose demand? [y/n]",
        );

        if (!confirmation) {
            return "Command aborted by user";
        }

        const unikType = await this.getUnikType(flags.unikid);

        await this.checkExplicitValues(flags.unikid, unikType, flags.explicitValue);

        const transactionStruct: Interfaces.ITransactionData = await this.createTransactionStruct(
            flags,
            unikType,
            passphrases.first,
            passphrases.second,
        );

        if (!transactionStruct.id) {
            throw new Error("Transaction id can't be undefined");
        }

        const transactionFromNetwork = await this.sendAndWaitConfirmations(
            transactionStruct,
            flags["await-confirmation"],
            1,
        );

        return await this.formatResult(transactionFromNetwork, transactionStruct.id);
    }

    private async checkUnik(unikId: string) {
        // Check unikid format
        checkUnikIdFormat(unikId);

        try {
            await this.api.getUnikById(unikId);
        } catch (e) {
            throw new Error("unikid is not valid");
        }
    }

    private async sendAndWaitConfirmations(
        transactionStruct: Interfaces.ITransactionData,
        awaitDuring: number,
        confirmations: number,
    ) {
        /**
         * Transaction broadcast
         */

        await this.withAction(
            "Sending transaction",
            async transactionStruct => {
                const sendResponse = await this.api.sendTransaction(transactionStruct);
                if (sendResponse.errors) {
                    throw new Error(sendResponse.errors);
                }
                this.info(
                    `Transaction to disclose explicit values sent to the pool (${this.getTransactionUrl(
                        transactionStruct.id,
                    )})`,
                );
                return sendResponse;
            },
            transactionStruct,
        );

        const transactionFromNetwork = await this.withAction(
            "Waiting for transaction confirmation",
            this.waitTransactionConfirmations.bind(this), // needs .bind(this) to use the correct this in waitTransactionConfirmations function
            this.api.getBlockTime(),
            transactionStruct.id,
            awaitDuring,
            confirmations,
        );

        if (!transactionFromNetwork) {
            return transactionStruct.id;
        }

        return transactionFromNetwork;
    }

    private async getUnikType(unikId: string): Promise<DIDType> {
        // get unik type
        const unikType: PropertyValue = (await this.api.getUnikProperty(unikId, "type", false)) as PropertyValue;
        if (!unikType) {
            throw new Error(`Unable to get UNIK type (id: ${unikId})`);
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
                const fingerPrintResult = await this.api.computeTokenId(explicit, unikType, "UNIK");
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
        unikType: DIDType,
        passphrase: string,
        secondPassphrase: string,
    ): Promise<any | string> {
        // Create Disclose Demand
        const discloseDemand: IDiscloseDemand = buildDiscloseDemand(
            flags.unikid,
            flags.explicitValue,
            DIDHelpers.fromLabel(unikType),
            passphrase,
        );

        const discloseDemandCertification: IDiscloseDemandCertification = await this.api.getDiscloseDemandCertification(
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
        return await this.withAction2<Interfaces.ITransactionData>("Creating transaction", todo);
    }
}
