import { Interfaces } from "@uns/ark-crypto";
import { ChainMeta, Transaction } from "@uns/ts-sdk";
import { BaseCommand } from "./baseCommand";
import { awaitConfirmationFlag, feeFlag, passphraseFlag, secondPassphraseFlag, senderAccountFlag } from "./utils";

export abstract class WriteCommand extends BaseCommand {
    public static flags = WriteCommand.getWriteCommandFlags();
    protected static getWriteCommandFlags(senderAccount: boolean = true, fees?: number) {
        let flags = {
            ...BaseCommand.baseFlags,
            ...feeFlag(fees),
            ...awaitConfirmationFlag,
            ...passphraseFlag,
            ...secondPassphraseFlag,
        };
        if (senderAccount) {
            flags = { ...flags, ...senderAccountFlag() };
        }
        return flags;
    }

    public async sendAndWaitConfirmationsIfNeeded(
        transaction: Interfaces.ITransactionData,
        flags: Record<string, any>,
    ): Promise<any> {
        if (!transaction.id) {
            throw new Error("Transaction id can't be undefined");
        }

        await this.broadcastTransaction(transaction);

        if (!this.checkIfAwaitIsNeeded(flags, transaction.id)) {
            return {
                data: {
                    transaction: transaction.id,
                },
            };
        }

        return await this.awaitConfirmations(flags, transaction.id);
    }

    private checkIfAwaitIsNeeded(flags: Record<string, any>, transactionId: string): boolean {
        const awaitConfirmation: number = flags["await-confirmation"];
        if (awaitConfirmation === 0) {
            this.info(`Transaction accepted by the network: ${transactionId}`);
            this.warn(
                "Transaction not confirmed yet, still in the pool. Track status of the transaction in the chain explorer.",
            );
            return false;
        }
        return true;
    }

    private async awaitConfirmations(
        flags: Record<string, any>,
        transactionId: string,
    ): Promise<(Transaction & { chainmeta: ChainMeta; confirmations: number }) | undefined> {
        const awaitAction = async () => {
            return await this.waitTransactionConfirmations(
                this.unsClientWrapper.getBlockTime(),
                transactionId,
                flags["await-confirmation"],
                1,
            );
        };

        return await this.withAction("Waiting for transaction confirmation", awaitAction);
    }

    private async broadcastTransaction(transaction: Interfaces.ITransactionData, successInfo?: string) {
        this.info("Broadcast transaction %o", transaction);

        /**
         * Transaction broadcast
         */
        const sendAction = async () => {
            const sendResponse = await this.unsClientWrapper.sendTransaction(transaction);
            if (sendResponse.errors) {
                throw new Error(sendResponse.errors);
            }
            if (successInfo) {
                this.info(successInfo);
            }
        };

        await this.withAction<Interfaces.ITransactionData>("Sending transaction", sendAction);
    }
}
