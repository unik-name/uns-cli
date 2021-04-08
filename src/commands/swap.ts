import { flags } from "@oclif/command";
import { Interfaces } from "@uns/ark-crypto";
import { CryptoAccountPassphrases } from "types";
import { cli } from "cli-ux";

import { BaseCommand } from "../baseCommand";
import { WriteCommand } from "../writeCommand";
import { SendCommandHelper } from "../commandHelpers/send-helper";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../formater";
import {
    checkFlag,
    getWalletAddress,
    getWalletFromPassphrase,
    isDid,
    isTokenId,
    fromSatoshi,
    toSatoshi,
} from "../utils";

const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

// TODO: Include real ETH transaction fees in the swap (amount of wUNS tokens to not mint, as a fee)
/**
 * Keep 100 uns as fee now for testing
 *
 * This is just for showing a preview message as it is the bridge-core that will do the wUNS minting and substract the fee!
 */
const getSwapCost = async () => 1_0000;

// FIXME: Put the bridge wallet addresses in the UNS SDK
const getBridgeWalletAddress = (flags: Record<string, any>) => {
    switch (flags.network) {
        case "livenet":
            throw new Error("Livenet swap is not supported yet");
        case "sandbox":
            if (flags.dev) {
                return "Sc68Hu6hRTCy9z4b7ppoeD24AX227fZ5UX";
            } else {
                return "SSL88CE3Ftb7dbdRwCFmNYgYdD2RrXkNZr";
            }
        // @ts-ignore
        case "dalinet":
            if (process.env.NODE_ENV === "test") return "Sc68Hu6hRTCy9z4b7ppoeD24AX227fZ5UX";
        default:
            throw new Error("Unsupported swap network");
    }
};

const feesIncludedFlagId = "fees-included";

export class SwapCommand extends WriteCommand {
    public static description = "Swap owned UNS protocol tokens for wUNS on a Ethereum wallet.";

    public static examples = [`$ uns swap 1237.77 0x76778aede1afc5031fab1c761c41130f31415424`];

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
        dev: flags.boolean({
            description: "If true, send token to dev token vault",
            default: false,
        }),
    };

    public static args = [
        {
            name: "amount",
            description: "The quantity of tokens to swap to the Ethereum chain.",
            required: true,
        },
        {
            name: "target",
            description: "Target Ethereum address",
            required: true,
        },
    ];

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return SwapCommand;
    }

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<NestedCommandOutput> {
        const cmdHelper = new SendCommandHelper(this);

        const bridgeWalletAddress: string = getBridgeWalletAddress(flags);

        // Check and get amount
        const amount: number = cmdHelper.checkAndGetAmount(args.amount, flags.sato);
        const satoAmount = flags.sato ? amount : toSatoshi(amount);

        const swapCost = await getSwapCost();

        const ethRecipientAddress: string = args.target;
        if (!ethRecipientAddress.match(ethAddressRegex)) {
            throw new Error("Target address is not a valid Ethereum address");
        }

        const transactionSatoAmount: number = flags[feesIncludedFlagId] ? satoAmount - flags.fee : satoAmount;

        if (transactionSatoAmount <= 0) {
            this.stop("Insufficient transferred amount to pay UNS transaction fees.");
            this.exit(0);
        }

        if (transactionSatoAmount - swapCost <= 0) {
            this.stop(
                "Insufficient swapped amount to compensate for Ethereum transaction fees. " +
                    `Swapping costs ${swapCost} UNS.`,
            );
            this.exit(0);
        }

        // Confirm ETH target address
        let canContinue: boolean = await cli.confirm(
            `Do really want to swap your UNS tokens to this Ethereum wallet: ${ethRecipientAddress} ?`,
        );

        // Confirm swap fee
        canContinue = await cli.confirm(
            `Swapping will cost you ${fromSatoshi(
                swapCost,
            )} UNS right now to compensate for Ethereum transaction fees.\n` +
                `You will receive ${fromSatoshi(transactionSatoAmount) - fromSatoshi(swapCost)} wUNS. Do you confirm?`,
        );

        if (!canContinue) {
            this.exit(0); // Normal exit
        }

        const passphrases: CryptoAccountPassphrases = await this.askForPassphrases(flags);

        const senderWallet = getWalletFromPassphrase(passphrases.first, this.unsClientWrapper.network);

        if (flags.senderAccount) {
            // Check if senderAccount correspond to first passphrase
            let unikNameSenderAddress: string;
            if (isDid(flags.senderAccount) || isTokenId(flags.senderAccount)) {
                unikNameSenderAddress = (await this.targetResolve(flags, flags.senderAccount)).ownerAddress;
            } else {
                unikNameSenderAddress = await getWalletAddress(flags.senderAccount, this.unsClientWrapper);
            }

            if (unikNameSenderAddress !== senderWallet.address) {
                throw new Error(`Wrong passphrase for sender account ${flags.senderAccount}`);
            }
            await cmdHelper.checkAndConfirmWallet(false, unikNameSenderAddress);
        }

        const nonce = await this.getNextWalletNonceFromPassphrase(passphrases.first);
        const vendorField = `eth:${ethRecipientAddress}`;

        const transaction: Interfaces.ITransactionData = cmdHelper.createTransactionStruct(
            this,
            transactionSatoAmount,
            flags.fee,
            bridgeWalletAddress,
            nonce,
            vendorField,
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
