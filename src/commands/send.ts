import { flags } from "@oclif/command";
import { Address, crypto, ITransactionData } from "@uns/crypto";
import { didResolve } from "@uns/ts-sdk";
import cli from "cli-ux";
import { BaseCommand } from "../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../formater";
import {
    awaitFlag,
    checkPassphraseFormat,
    confirmationsFlag,
    createTransferTransaction,
    getPassphraseFromUser,
    getSecondPassphraseFromUser,
    getWalletFromPassphrase,
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

    public static DEFAULT_FEES: number = 1; // 1UNS fees (100000000 if sato flag is activated)

    public static flags = {
        ...WriteCommand.getWriteCommandFlags(SendCommand.DEFAULT_FEES),
        ...passphraseFlag,
        ...secondPassphraseFlag,
        to: flags.string({
            description: "The recipient public address OR the @unik-name of the recipient.",
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
        sato: flags.boolean({
            description: "Specify that the provided amount is in sato-UNS, not in UNS",
            default: false,
        }),
        senderAccount: flags.string({
            description: "The @unik-name OR the public address of the wallet of the sender.",
        }),
    };

    public static args = [
        {
            name: "amount",
            description: "The quantity of tokens to send to the recipient.",
            required: true,
        },
    ];

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return SendCommand;
    }

    protected async do(flags: Record<string, any>, args?: Record<string, any>): Promise<any> {
        if (flags.to === flags.senderAccount) {
            throw new Error("Recipient and Owner are the same");
        }

        // Check and get amount
        const amount: number = this.checkAndGetAmount(args.amount, flags.sato);
        const satoAmount = flags.sato ? amount : toSatoshi(amount);

        const recipientAddress = await this.resolveWalletAddress(flags.to);

        // Check recipient wallet existence if needed
        const canContinue = await this.checkAndConfirmWallet(flags.check, recipientAddress);
        if (!canContinue) {
            return "Command aborted by user";
        }

        const passphrases = await this.askForPassphrases(flags);

        if (flags.senderAccount) {
            // Check if senderAccount correspond to first passphrase
            const unikNameSenderAddress = await this.resolveWalletAddress(flags.senderAccount, false);
            await this.checkAndConfirmWallet(false, unikNameSenderAddress, passphrases.first);
        }

        const satoFees = this.getFees(flags.sato, flags.fee);

        const transactionSatoAmount: number = flags[feesIncludedFlagId] ? satoAmount - satoFees : satoAmount;

        const transaction: ITransactionData = this.createTransactionStruct(
            transactionSatoAmount,
            satoFees,
            recipientAddress,
            this.api.getVersion(),
            passphrases.first,
            passphrases.second,
        );

        const transactionFromNetwork = await this.sendAndWaitTransactionConfirmations(transaction);

        return this.formatOutput(transactionFromNetwork, transaction.id);
    }

    private getFees(isSato: boolean, fee: number): number {
        return isSato ? (fee === SendCommand.DEFAULT_FEES ? toSatoshi(fee) : fee) : toSatoshi(fee);
    }

    private async askForPassphrases(flags): Promise<{ first: string; second: string }> {
        /**
         * Get passphrase
         */
        let passphrase: string = flags.passphrase;
        if (!passphrase) {
            passphrase = await getPassphraseFromUser();
        }

        checkPassphraseFormat(passphrase);

        /**
         * Get second passphrase
         */
        let secondPassphrase: string = flags.secondPassphrase;

        if (!secondPassphrase && (await this.isSecondPassphraseNeeded(passphrase))) {
            secondPassphrase = await getSecondPassphraseFromUser();
        }

        if (secondPassphrase) {
            checkPassphraseFormat(secondPassphrase);
        }

        return {
            first: passphrase,
            second: secondPassphrase,
        };
    }

    private createTransactionStruct(
        satoAmount: number,
        satoFees: number,
        to: string,
        networkVersion: number,
        passphrase: string,
        secondPassphrase: string,
    ): ITransactionData {
        this.actionStart("Creating transaction");
        const sendTransactionStruct = createTransferTransaction(
            this.client,
            satoAmount,
            satoFees,
            to,
            networkVersion,
            passphrase,
            secondPassphrase,
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

    private checkAndGetAmount(amountArg: string, isSatoAmount: boolean) {
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

        if (isSatoAmount && !Number.isInteger(amount)) {
            throw new Error("sato UNS amount has to be an integer");
        }

        return amount;
    }

    private async resolveWalletAddress(id: string, isRecipient: boolean = true): Promise<string> {
        let resolvedAddress: string;

        if (id && id.startsWith("@")) {
            try {
                const resolveResult = await didResolve(`${id}?*`, this.api.network.name);
                if (resolveResult.error) {
                    throw resolveResult.error;
                }
                resolvedAddress = resolveResult.data as string;
            } catch (e) {
                if (e && e.response && e.response.status === 404) {
                    throw new Error(`${isRecipient ? "Recipient" : "Sender"} @unik-name does not exist`);
                }
                throw new Error(`${isRecipient ? "Recipient" : "Sender"} @unik-name does not match expected format`);
            }
        } else {
            if (!crypto.validateAddress(id, this.api.getVersion())) {
                try {
                    resolvedAddress = Address.fromPublicKey(id);
                } catch (_) {
                    throw new Error(`${isRecipient ? "Recipient" : "Sender"} address does not match expected format`);
                }
            } else {
                resolvedAddress = id;
            }
        }
        return resolvedAddress;
    }

    private async checkAndConfirmWallet(checkWalletExistence: boolean, address: string, passphrase?: string) {
        if (checkWalletExistence) {
            this.actionStart("Check recipient existence");
            const exists = await this.checkWalletExistence(address);
            this.actionStop();
            if (!exists) {
                this.warn("The recipient address does not exist on chain yet");
                return await cli.confirm(`Do really want to send tokens to this wallet?`);
            }
        }

        if (passphrase) {
            const wallet = await getWalletFromPassphrase(passphrase, this.api.network);
            if (wallet.address !== address) {
                throw new Error(`Wrong passphrase for wallet ${address}`);
            }
        }
        return true;
    }

    /**
     * Check if wallet exists
     * @param walletAddress
     */
    private async checkWalletExistence(walletAddress: string): Promise<boolean> {
        return this.applyWalletPredicate(walletAddress, wallet => !!wallet);
    }

    private formatOutput(transactionFromNetwork: any, transactionId: string) {
        if (!transactionFromNetwork) {
            this.error(
                `Transaction not found yet, the network can be slow. Check this url in a while: ${this.getTransactionUrl(
                    transactionId,
                )}`,
            );
        }

        return {
            transaction: transactionFromNetwork.id,
            confirmations: transactionFromNetwork.confirmations,
        };
    }

    private getTransactionUrl(transactionId: string) {
        return `${this.api.getExplorerUrl()}/transaction/${transactionId}`;
    }
}
