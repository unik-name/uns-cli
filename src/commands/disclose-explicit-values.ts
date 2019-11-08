import { ITransactionData } from "@uns/crypto";
import {
    buildDiscloseDemand,
    DIDHelpers,
    DIDType,
    DiscloseDemand,
    DiscloseDemandCertification,
    Response,
} from "@uns/ts-sdk";
import { cli } from "cli-ux";
import { BaseCommand } from "../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../formater";
import {
    checkPassphraseFormat,
    checkUnikIdFormat,
    createDiscloseTransaction,
    explicitValueFlag,
    getPassphraseFromUser,
    getSecondPassphraseFromUser,
    passphraseFlag,
    unikidFlag,
} from "../utils";
import { WriteCommand } from "../writeCommand";

export class DiscloseExplicitValuesCommand extends WriteCommand {
    public static description = "Disclose one or multiple explicitValues of your UNIK identifier.";

    public static examples = [
        `$ uns disclose-explicit-values --unikid 636795fff13c8f2d2fd90f9aa124d7f583920fce83588895c917927ee522db3b -e bob b0b --network devnet`,
    ];

    public static flags = {
        ...WriteCommand.getWriteCommandFlags(),
        ...passphraseFlag,
        ...unikidFlag("The UNIK token on which to disclose values"),
        ...explicitValueFlag("Array of explicit value to disclose, separated with a space.", true),
    };

    private passphrase: string;
    private secondPassphrase: string;
    private unikType: DIDType;

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
        return DiscloseExplicitValuesCommand;
    }

    protected async do(flags: Record<string, any>): Promise<any> {
        await this.checkUnik(flags.unikid);

        await this.getInformationsFromUser(flags);

        const confirmation = await cli.confirm(
            "Disclosing a @unik-name to the network can't be cancelled nor revoked. Your ID will be disclosed forever. Do you confirm the disclose demand? [y/n]",
        );

        if (!confirmation) {
            return "Command aborted by user";
        }

        await this.checkExplicitValues(flags.unikid, flags.explicitValue);

        const transactionStruct: ITransactionData = await this.createTransactionStruct(flags);

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
        transactionStruct: ITransactionData,
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

    private async getInformationsFromUser(flags: Record<string, any>) {
        /**
         * Get passphrase
         */
        this.passphrase = flags.passphrase;
        if (!this.passphrase) {
            this.passphrase = await getPassphraseFromUser();
        }

        // Check passphrase format
        checkPassphraseFormat(this.passphrase);

        /**
         * Get second passphrase
         */
        this.secondPassphrase = flags.secondPassphrase;

        if (!this.secondPassphrase && (await this.isSecondPassphraseNeeded(this.passphrase))) {
            this.secondPassphrase = await getSecondPassphraseFromUser();
        }

        if (this.secondPassphrase) {
            // Check second passphrase format
            checkPassphraseFormat(this.secondPassphrase);
        }
    }

    private async checkExplicitValues(unikId: string, listOfExplicitValues: string[]) {
        // get unik type
        const type: number = Number.parseInt((await this.unsClient.unik.property(unikId, "type")).data);

        this.unikType = DIDHelpers.fromCode(type);

        // Check explicit values
        for (const explicit of listOfExplicitValues) {
            const fingerPrintResult = await this.unsClient.fingerprint.compute(explicit, this.unikType);

            if (fingerPrintResult.error) {
                this.debug(`disclose-explicit-values - ${fingerPrintResult.error.message}`);
                throw new Error("At least one expliciteValue does not match expected format");
            }
            if (fingerPrintResult.data.fingerprint !== unikId) {
                throw new Error("At least one expliciteValue is not valid for this unikid");
            }
        }

        this.info("ExpliciteValues valid for this unikid");
    }

    private async createTransactionStruct(flags: Record<string, any>): Promise<any | string> {
        // Create Disclose Demand
        const discloseDemand: DiscloseDemand = buildDiscloseDemand(
            flags.unikid,
            flags.explicitValue,
            DIDHelpers.fromLabel(this.unikType),
            this.passphrase,
        );

        const discloseDemandCertification: Response<
            DiscloseDemandCertification
        > = await this.unsClient.discloseDemandCertification.get(discloseDemand);

        if (discloseDemandCertification.error) {
            throw new Error(discloseDemandCertification.error.message);
        }

        /**
         * Transaction creation
         */
        return await this.createTransaction(
            discloseDemand,
            discloseDemandCertification.data,
            flags.fee,
            this.passphrase,
            this.secondPassphrase,
        );
    }

    private async createTransaction(
        discloseDemand: DiscloseDemand,
        discloseDemandCertification: DiscloseDemandCertification,
        fees: number,
        passphrase: string,
        secondPassphrase?: string,
    ): Promise<ITransactionData> {
        return await this.withAction<ITransactionData>(
            "Creating transaction",
            createDiscloseTransaction,
            this.client,
            discloseDemand,
            discloseDemandCertification,
            fees,
            this.api.getVersion(),
            passphrase,
            secondPassphrase,
        );
    }
}
