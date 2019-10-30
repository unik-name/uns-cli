import { flags } from "@oclif/command";
import { crypto, ITransactionData, KeyPair } from "@uns/crypto";
import cli from "cli-ux";
import { BaseCommand } from "../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../formater";
import {
    awaitFlag,
    checkPassphraseFormat,
    confirmationsFlag,
    createTransferTransaction,
    fromSatoshi,
    getPassphraseFromUser,
    getSecondPassphraseFromUser,
    passphraseFlag,
    secondPassphraseFlag,
    toSatoshi,
} from "../utils";
import { WriteCommand } from "../writeCommand";

const feesIncludedFlagId = "fees-included";

export class SendCommand extends WriteCommand {
    public static description = "Send owned UNS protocol tokens to another wallet.";

    public static examples = [
        `$ uns send 1237.77 --to DNLmWfFkXHcrBHmr8UTWpNGmTrX9WohZH3 --network devnet --format json`,
    ];

    public static flags = {
        ...WriteCommand.flags,
        ...passphraseFlag,
        ...secondPassphraseFlag,
        to: flags.string({
            description: "The recipient address.",
            required: true,
        }),
        check: flags.boolean({
            description:
                "Allow sending tokens to an address that do not exists on chain yet. (--no-check to bypass recipient check)",
            default: true,
            allowNo: true,
        }),
        [feesIncludedFlagId]: flags.boolean({
            description: "Specify that the fees must be deducted from the amount. By default the fees are paid on top.",
            default: false,
        }),
        ...awaitFlag,
        ...confirmationsFlag,
    };

    public static args = [
        {
            name: "amount",
            description: "The quantity of tokens to send to the recipient.",
            required: true,
        },
    ];

    private passphrase: string;
    private secondPassphrase: string;

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return SendCommand;
    }

    protected async do(flags: Record<string, any>, args?: Record<string, any>): Promise<any> {
        // Check and get amount
        const amount: number = this.checkAndGetAmount(args.amount);

        // Check recipient wallet existence if needed
        const canContinue = await this.checkAndConfirmRecipient(flags.check, flags.to, amount);
        if (!canContinue) {
            return "Command aborted by user";
        }

        await this.askForPassphrases(flags);

        const transactionAmount: number = flags[feesIncludedFlagId] ? amount - fromSatoshi(flags.fee) : amount;

        const transaction: ITransactionData = this.createTransactionStruct(transactionAmount, flags.fee, flags.to);

        const transactionFromNetwork = await this.sendAndWaitTransactionConfirmations(transaction);

        return this.formatOutput(transactionFromNetwork, transaction.id);
    }

    private async askForPassphrases(flags) {
        /**
         * Get passphrase
         */
        this.passphrase = flags.passphrase;
        if (!this.passphrase) {
            this.passphrase = await getPassphraseFromUser();
        }

        checkPassphraseFormat(this.passphrase);

        /**
         * Get second passphrase
         */
        this.secondPassphrase = flags.secondPassphrase;

        if (!this.secondPassphrase && (await this.isSecondPassphraseNeeded(this.passphrase))) {
            this.secondPassphrase = await getSecondPassphraseFromUser();
        }

        if (this.secondPassphrase) {
            checkPassphraseFormat(this.secondPassphrase);
        }
    }

    private createTransactionStruct(amount: number, fees: number, to: string): ITransactionData {
        this.actionStart("Creating transaction");
        const sendTransactionStruct = createTransferTransaction(
            this.client,
            toSatoshi(amount),
            fees,
            to,
            this.api.getVersion(),
            this.passphrase,
            this.secondPassphrase,
        );
        this.actionStop();
        return sendTransactionStruct;
    }

    private async sendAndWaitTransactionConfirmations(transaction: ITransactionData) {
        this.actionStart("Sending transaction");
        const sendResponse = await this.api.sendTransaction(transaction);
        this.actionStop();
        if (sendResponse.errors) {
            throw new Error(sendResponse.errors);
        }

        this.actionStart("Waiting for transaction confirmation");
        const transactionFromNetwork = await this.waitTransactionConfirmations(
            this.api.getBlockTime(),
            transaction.id,
            1,
            1,
        );
        this.actionStop();
        return transactionFromNetwork;
    }

    private checkAndGetAmount(amountArg: string) {
        // Check amount
        const amountParts = amountArg.replace(" ", "").split(".");

        if (amountArg.includes(",") || amountParts.length > 2) {
            throw new Error("Please, only use a decimal point for the amount");
        }

        if (amountParts.length === 2 && amountParts[1].length > 8) {
            throw new Error(
                "The number of significant digits displayed after floating point numbers has to be lower or equal to 8",
            );
        }

        const amount = Number.parseFloat(amountArg);
        if (isNaN(amount) || amount <= 0) {
            throw new Error("The amount should be a positive number");
        }

        return amount;
    }

    private async checkAndConfirmRecipient(checkExistence: boolean, recipient: string, amount: number) {
        // check recipient address format
        if (!crypto.validateAddress(recipient)) {
            throw new Error("Recipient address does not match expected format");
        }

        if (checkExistence) {
            this.actionStart("Check recipient existence");
            const exists = await this.checkRecipientWalletExistence(recipient);
            this.actionStop();
            if (!exists) {
                this.warn("The recipient address does not exist on chain yet");
                return await cli.confirm(`Do really want to send ${amount} to this wallet?`);
            }
        }
        return true;
    }

    /**
     * Check if wallet exists
     * @param recipient
     */
    private async checkRecipientWalletExistence(recipient: string): Promise<boolean> {
        return this.applyWalletPredicate(recipient, wallet => !!wallet);
    }
    private formatOutput(transactionFromNetwork: any, transactionId: string) {
        if (!transactionFromNetwork) {
            this.error(
                `Transaction not found yet, the network can be slow. Check this url in a while: ${this.getTranscationUrl(
                    transactionId,
                )}`,
            );
        }

        return {
            transaction: transactionFromNetwork.id,
            confirmations: transactionFromNetwork.confirmations,
        };
    }

    private getTranscationUrl(transactionId: string) {
        return `${this.api.getExplorerUrl()}/transaction/${transactionId}`;
    }
}
