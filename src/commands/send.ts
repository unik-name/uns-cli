import { flags } from "@oclif/command";
import { Interfaces } from "@uns/ark-crypto";
import { CryptoAccountPassphrases } from "types";
import { BaseCommand } from "../baseCommand";
import { SendCommandHelper } from "../commandHelpers/send-helper";
import { Formater, OUTPUT_FORMAT } from "../formater";
import { checkFlag, getTargetArg, getWalletFromPassphrase, isDid, isTokenId, toSatoshi } from "../utils";
import { WriteCommand } from "../writeCommand";

const feesIncludedFlagId = "fees-included";

export class SendCommand extends WriteCommand {
    public static description = "Send owned UNS protocol tokens to another wallet.";

    public static examples = [`$ uns send 1237.77 "@bob"`];

    public static flags = {
        ...WriteCommand.getWriteCommandFlags(),
        ...checkFlag(
            "Check if recipient address exists on chain before sending tokens. (--no-check to bypass recipient check)",
        ),
        [feesIncludedFlagId]: flags.boolean({
            description: "Specify that the fees must be deducted from the amount. By default the fees are paid on top.",
            default: false,
        }),
        sato: flags.boolean({
            description: "Specify that the provided amount is in sato-UNS, not in UNS",
            default: false,
        }),
    };

    public static args = [
        {
            name: "amount",
            description: "The quantity of tokens to send to the recipient.",
            required: true,
        },
        getTargetArg(),
    ];

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return SendCommand;
    }

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<any> {
        const cmdHelper = new SendCommandHelper(this);

        // Check and get amount
        const amount: number = cmdHelper.checkAndGetAmount(args.amount, flags.sato);
        const satoAmount = flags.sato ? amount : toSatoshi(amount);

        const transactionSatoAmount: number = flags[feesIncludedFlagId] ? satoAmount - flags.fee : satoAmount;

        if (transactionSatoAmount <= 0) {
            this.stop("Insufficient transferred amount to pay transaction fees.");
            return undefined;
        }

        let recipientAddress: string;
        if (isDid(args.target) || isTokenId(args.target)) {
            recipientAddress = (await this.targetResolve(flags, args.target)).ownerAddress;
        } else {
            recipientAddress = await cmdHelper.getWalletAddress(args.target);
        }

        // Check recipient wallet existence if needed
        const canContinue = await cmdHelper.checkAndConfirmWallet(flags.check, recipientAddress);
        if (!canContinue) {
            return "Command aborted by user";
        }

        const passphrases: CryptoAccountPassphrases = await this.askForPassphrases(flags);

        const senderWallet = getWalletFromPassphrase(passphrases.first, this.unsClientWrapper.network);
        if (senderWallet.address === recipientAddress) {
            throw new Error("Recipient and Owner are the same");
        }

        if (flags.senderAccount) {
            // Check if senderAccount correspond to first passphrase
            let unikNameSenderAddress: string;
            if (isDid(flags.senderAccount) || isTokenId(flags.senderAccount)) {
                unikNameSenderAddress = (await this.targetResolve(flags, flags.senderAccount)).ownerAddress;
            } else {
                unikNameSenderAddress = await cmdHelper.getWalletAddress(flags.senderAccount, false);
            }

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

        const transactionFromNetwork = await this.sendAndWaitConfirmationsIfNeeded(transaction, flags);

        return cmdHelper.formatOutput(transactionFromNetwork, transaction.id);
    }
}
