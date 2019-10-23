import {
    buildDiscloseDemand,
    DIDHelpers,
    DiscloseDemand,
    DiscloseDemandCertification,
    Network,
    Response,
    UNSClient,
} from "@uns/ts-sdk";
import { cli } from "cli-ux";
import { BaseCommand } from "../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../formater";
import {
    awaitFlag,
    checkPassphraseFormat,
    checkUnikIdFormat,
    confirmationsFlag,
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
        ...WriteCommand.flags,
        ...passphraseFlag,
        ...awaitFlag,
        ...confirmationsFlag,
        ...unikidFlag("The UNIK token on which to disclose values"),
        ...explicitValueFlag("Array of explicit value to disclose, separated with a space.", true),
    };

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return DiscloseExplicitValuesCommand;
    }

    protected async do(flags: Record<string, any>): Promise<any> {
        // Check unikid format
        checkUnikIdFormat(flags.unikid);

        try {
            this.api.getUnikById(flags.unikid);
        } catch (e) {
            throw new Error("unikid is not valid");
        }

        /**
         * Get passphrase
         */
        let passphrase = flags.passphrase;
        if (!passphrase) {
            passphrase = await getPassphraseFromUser();
        }

        // Check passphrase format
        checkPassphraseFormat(passphrase);

        /**
         * Get second passphrase
         */
        let secondPassphrase = flags.secondPassphrase;

        if (!secondPassphrase && (await this.isSecondPassphraseNeeded(passphrase))) {
            secondPassphrase = await getSecondPassphraseFromUser();
        }

        if (secondPassphrase) {
            // Check second passphrase format
            checkPassphraseFormat(secondPassphrase);
        }

        const confirmation = await cli.confirm(
            "Disclosing a @unik-name to the network can't be cancelled nor revoked. Your ID will be disclosed forever. Do you confirm the disclose demand? [y/n]",
        );

        if (!confirmation) {
            return "Command aborted by user";
        }

        const network: Network = flags.network === "local" ? "dalinet" : flags.network.toLowerCase();
        const unsClient = new UNSClient(network);

        // get unik type
        const type: number = Number.parseInt((await unsClient.unik.property(flags.unikid, "type")).data);

        const unikType = DIDHelpers.fromCode(type);

        // Check explicit values
        for (const explicit of flags.explicitValue as string[]) {
            const fingerPrintResult = await unsClient.fingerprint.compute(explicit, unikType);

            if (fingerPrintResult.error) {
                this.debug(`disclose-explicit-values - ${fingerPrintResult.error.message}`);
                throw new Error("At least one expliciteValue does not match expected format");
            }
            if (fingerPrintResult.data.fingerprint !== flags.unikid) {
                throw new Error("At least one expliciteValue is not valid for this unikid");
            }
        }

        this.info("ExpliciteValues valid for this unikid");

        // Create Disclose Demand
        const discloseDemand: DiscloseDemand = buildDiscloseDemand(
            flags.unikid,
            flags.explicitValue,
            unikType,
            passphrase,
        );

        const discloseDemandCertification: Response<
            DiscloseDemandCertification
        > = await unsClient.discloseDemandCertification.get(discloseDemand);

        if (discloseDemandCertification.error) {
            return this.error(discloseDemandCertification.error.message);
        }

        /**
         * Transaction creation
         */
        this.actionStart("Creating transaction");
        const transactionStruct = createDiscloseTransaction(
            this.client,
            discloseDemand,
            discloseDemandCertification.data,
            flags.fee,
            this.api.getVersion(),
            passphrase,
            secondPassphrase,
        );

        this.actionStop();

        /**
         * Transaction broadcast
         */
        this.actionStart("Sending transaction");
        const sendResponse = await this.api.sendTransaction(transactionStruct);
        this.actionStop();
        if (sendResponse.errors) {
            throw new Error(sendResponse.errors);
        }
        const transactionUrl = `${this.api.getExplorerUrl()}/transaction/${transactionStruct.id}`;
        this.info(`Transaction to disclose explicit values sent to the pool (${transactionUrl})`);

        /**
         * Wait for the first transaction confirmation (2 blocktimes max)
         */
        this.actionStart("Waiting for transaction confirmation");
        const transactionFromNetwork = await this.waitTransactionConfirmations(
            this.api.getBlockTime(),
            transactionStruct.id,
            flags.await,
            flags.confirmations,
        );
        this.actionStop();

        /**
         * Result prompt
         */
        if (transactionFromNetwork) {
            if (transactionFromNetwork.confirmations) {
                this.info("Transaction confirmed by the network.");
            }
        } else {
            this.error(
                `Transaction not found yet, the network can be slow. Check this url in a while: ${transactionUrl}`,
            );
        }
        return {
            data: {
                transaction: transactionStruct.id,
                confirmations: transactionFromNetwork.confirmations,
            },
        };
    }
}
