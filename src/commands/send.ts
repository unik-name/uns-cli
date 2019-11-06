import { flags } from "@oclif/command";
import { ITransactionData } from "@uns/crypto";
import { BaseCommand } from "../baseCommand";
import { SendCommandHelper } from "../commandHelpers/send-helper";
import { Formater, OUTPUT_FORMAT } from "../formater";
import { awaitFlag, confirmationsFlag, passphraseFlag, secondPassphraseFlag, toSatoshi } from "../utils";
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
                "Check if recipient address exists on chain before sending tokens. (--no-check to bypass recipient check)",
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
        const cmdHelper = new SendCommandHelper(this);

        if (flags.to === flags.senderAccount) {
            throw new Error("Recipient and Owner are the same");
        }

        // Check and get amount
        const amount: number = cmdHelper.checkAndGetAmount(args.amount, flags.sato);
        const satoAmount = flags.sato ? amount : toSatoshi(amount);

        const recipientAddress = await cmdHelper.resolveWalletAddress(flags.to);

        // Check recipient wallet existence if needed
        const canContinue = await cmdHelper.checkAndConfirmWallet(flags.check, recipientAddress);
        if (!canContinue) {
            return "Command aborted by user";
        }

        const passphrases = await cmdHelper.askForPassphrases(flags);

        if (flags.senderAccount) {
            // Check if senderAccount correspond to first passphrase
            const unikNameSenderAddress = await cmdHelper.resolveWalletAddress(flags.senderAccount, false);
            await cmdHelper.checkAndConfirmWallet(false, unikNameSenderAddress, passphrases.first);
        }

        const satoFees = cmdHelper.getSatoFees(flags.sato, flags.fee);

        const transactionSatoAmount: number = flags[feesIncludedFlagId] ? satoAmount - satoFees : satoAmount;

        const transaction: ITransactionData = cmdHelper.createTransactionStruct(
            this,
            transactionSatoAmount,
            satoFees,
            recipientAddress,
            this.api.getVersion(),
            passphrases.first,
            passphrases.second,
        );

        const transactionFromNetwork = await cmdHelper.sendAndWaitTransactionConfirmations(transaction);

        return cmdHelper.formatOutput(transactionFromNetwork, transaction.id);
    }
}
