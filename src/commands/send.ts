import { flags } from "@oclif/command";
import { Interfaces } from "@uns/ark-crypto";
import { BaseCommand } from "../baseCommand";
import { SendCommandHelper } from "../commandHelpers/send-helper";
import { Formater, OUTPUT_FORMAT } from "../formater";
import { getWalletFromPassphrase, passphraseFlag, secondPassphraseFlag, toSatoshi } from "../utils";
import { WriteCommand } from "../writeCommand";

const feesIncludedFlagId = "fees-included";

export class SendCommand extends WriteCommand {
    public static description = "Send owned UNS protocol tokens to another wallet.";

    public static examples = [
        `$ uns send 1237.77 --to DNLmWfFkXHcrBHmr8UTWpNGmTrX9WohZH3 --network devnet --format json`,
        `$ uns send 1237.77 --to "@bob"`,
    ];

    public static flags = {
        ...WriteCommand.getWriteCommandFlags(),
        ...passphraseFlag,
        ...secondPassphraseFlag,
        to: flags.string({
            description:
                "The recipient public address, public key OR the @unik-name of the recipient (warning: @unik-name must be surrounded with double quotes)",
            required: true,
        }),
        check: flags.boolean({
            description:
                "Check if recipient address exists on chain before sending tokens. (--no-check to bypass recipient check)",
            default: true,
            allowNo: true,
        }),
        [feesIncludedFlagId]: flags.boolean({
            description: "Specify that the fees must be deducted from the amount. By default the fees are paid on top.",
            default: false,
        }),
        sato: flags.boolean({
            description: "Specify that the provided amount is in sato-UNS, not in UNS",
            default: false,
        }),
        senderAccount: flags.string({
            description:
                "The @unik-name OR the public address of the wallet of the sender (warning: @unik-name must be surrounded with double quotes)",
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
        const cmdHelper = new SendCommandHelper(this);

        // Check and get amount
        const amount: number = cmdHelper.checkAndGetAmount(args?.amount, flags.sato);
        const satoAmount = flags.sato ? amount : toSatoshi(amount);

        const transactionSatoAmount: number = flags[feesIncludedFlagId] ? satoAmount - flags.fee : satoAmount;

        if (transactionSatoAmount <= 0) {
            this.stop("Insufficient transferred amount to pay transaction fees.");
            return undefined;
        }

        const recipientAddress = await cmdHelper.resolveWalletAddress(flags.to);

        // Check recipient wallet existence if needed
        const canContinue = await cmdHelper.checkAndConfirmWallet(flags.check, recipientAddress);
        if (!canContinue) {
            return "Command aborted by user";
        }

        const passphrases = await this.askForPassphrases(flags);

        const senderWallet = getWalletFromPassphrase(passphrases.first, this.api.network);
        if (senderWallet.address === recipientAddress) {
            throw new Error("Recipient and Owner are the same");
        }

        if (flags.senderAccount) {
            // Check if senderAccount correspond to first passphrase
            const unikNameSenderAddress = await cmdHelper.resolveWalletAddress(flags.senderAccount, false);
            if (unikNameSenderAddress !== senderWallet.address) {
                throw new Error(`Wrong passphrase for sender account ${flags.senderAccount}`);
            }
            await cmdHelper.checkAndConfirmWallet(false, unikNameSenderAddress);
        }

        const nonce = await this.getNextWalletNonceFromPassphrase(passphrases.first);

        const transaction: Interfaces.ITransactionData = cmdHelper.createTransactionStruct(
            this,
            transactionSatoAmount,
            flags.fee,
            recipientAddress,
            // this.networkHash,
            nonce,
            passphrases.first,
            passphrases.second,
        );

        if (!transaction.id) {
            throw new Error("Transaction id can't be undefined");
        }

        const transactionFromNetwork = await cmdHelper.sendAndWaitTransactionConfirmations(
            transaction,
            flags["await-confirmation"],
            1,
        );

        return cmdHelper.formatOutput(transactionFromNetwork, transaction.id);
    }
}
