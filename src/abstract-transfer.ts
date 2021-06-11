import { Interfaces } from "@uns/ark-crypto";
import {
    isError,
    SdkResult,
    createCertifiedNftTransferTransaction,
    UnikTransferCertifiedTransactionBuildOptions,
} from "@uns/ts-sdk";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "./formater";
import { WriteCommand } from "./writeCommand";
import { Identities } from "@uns/ark-crypto";

export abstract class TransferCommand extends WriteCommand {
    protected abstract getUnikTransferCertifiedTransactionBuildOptions(
        flags: Record<string, any>,
        args: Record<string, any>,
    ): Promise<UnikTransferCertifiedTransactionBuildOptions>;

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<NestedCommandOutput> {
        const options: UnikTransferCertifiedTransactionBuildOptions = await this.getUnikTransferCertifiedTransactionBuildOptions(
            flags,
            args,
        );

        /**
         * Transaction creation
         */
        this.actionStart("Creating transaction");
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
                `UNIK nft transfered:  ${transactionFromNetwork.confirmations} confirmation${
                    transactionFromNetwork.confirmations > 0 ? "s" : ""
                }`,
            );

            const tokenUrl = `${this.unsClientWrapper.getExplorerUrl()}/uniks/${options.unikId}`;
            this.log(`UNIK nft in UNS explorer: ${tokenUrl}`);
        } else {
            this.error(
                `Transaction not found yet, the network can be slow. Check this url in a while: ${transactionUrl}`,
            );
        }
        return {
            data: {
                from: Identities.Address.fromPassphrase(options.passphrase),
                to: options.recipientAddress,
                id: options.unikId,
                transaction: result.id,
                confirmations: transactionFromNetwork.confirmations,
            },
        };
    }
}
