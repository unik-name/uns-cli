import { flags } from "@oclif/command";
import { Interfaces } from "@uns/ark-crypto";
import {
    isError,
    SdkResult,
    createCertifiedNftTransferTransaction,
    UnikTransferCertifiedTransactionBuildOptions,
} from "@uns/ts-sdk";
import { BaseCommand } from "../baseCommand";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../formater";
import { CryptoAccountPassphrases } from "../types";
import { WriteCommand } from "../writeCommand";
import { getTargetArg } from "../utils";

export class UnikTransferCommand extends WriteCommand {
    public static description = "Transfer UNIKNAME token";

    public static usage = "transfer TARGET --to {recipient}";

    public static examples = [`$ unikname transfer TARGET --to {recipient}`];

    public static flags = {
        ...WriteCommand.getWriteCommandFlags(true),
        ["to"]: flags.string({
            char: "t",
            description: "Recipient cryptoaccount address",
            required: true,
        }),
    };

    public static args = [getTargetArg()];

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return UnikTransferCommand;
    }

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<NestedCommandOutput> {
        const recipientAddress: string = flags.to;

        const unikId = (await this.targetResolve(flags, args.target)).unikid;

        const passphrases: CryptoAccountPassphrases = await this.askForPassphrases(flags);

        /**
         * Read emitter's wallet nonce
         */
        const nonce = await this.getNextWalletNonceFromPassphrase(passphrases.first);

        /**
         * Transaction creation
         */
        this.actionStart("Creating transaction");
        const options: UnikTransferCertifiedTransactionBuildOptions = {
            httpClient: this.unsClientWrapper.unsClient.http,
            unikId,
            recipientAddress,
            fees: flags.fee,
            nonce,
            passphrase: passphrases.first,
            secondPassPhrase: passphrases.second,
        };

        const result: SdkResult<Interfaces.ITransactionData> = await createCertifiedNftTransferTransaction(options);

        this.actionStop();

        if (isError(result)) {
            throw new Error(`${result.message} ${result.code ? ` (${result.code})` : ""}`);
        }

        if (!result.id) {
            throw new Error("Transaction id can't be undefined");
        }

        this.log(`Transaction id: ${result.id}`);
        const transactionUrl = `${this.unsClientWrapper.getExplorerUrl()}/transaction/${result.id}`;
        this.log(`Transaction in explorer: ${transactionUrl}`);

        const transactionFromNetwork = await this.sendAndWaitConfirmationsIfNeeded(result, flags);

        /**
         * Result prompt
         */
        if (transactionFromNetwork) {
            this.log(
                `UNIKNAME nft transfered:  ${transactionFromNetwork.confirmations} confirmation${
                    transactionFromNetwork.confirmations > 0 ? "s" : ""
                }`,
            );

            const tokenUrl = `${this.unsClientWrapper.getExplorerUrl()}/uniks/${unikId}`;
            this.log(`UNIKNAME nft in Unikname explorer: ${tokenUrl}`);
        } else {
            this.error(
                `Transaction not found yet, the network can be slow. Check this url in a while: ${transactionUrl}`,
            );
        }
        return {
            data: {
                id: unikId,
                transaction: result.id,
                confirmations: transactionFromNetwork.confirmations,
            },
        };
    }
}
