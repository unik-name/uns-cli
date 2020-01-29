import { Identities, Interfaces } from "@uns/ark-crypto";
import { ChainMeta, Transaction, Wallet } from "@uns/ts-sdk";
import { CryptoAccountPassphrases } from "types";
import { BaseCommand } from "./baseCommand";
import { HttpNotFoundError } from "./errorHandler";
import {
    awaitConfirmationFlag,
    checkPassphraseFormat,
    feeFlag,
    getPassphraseFromUser,
    getSecondPassphraseFromUser,
    passphraseFlag,
    secondPassphraseFlag,
    senderAccountFlag,
} from "./utils";

export abstract class WriteCommand extends BaseCommand {
    public static flags = WriteCommand.getWriteCommandFlags();
    protected static getWriteCommandFlags(fees?: number) {
        return {
            ...BaseCommand.baseFlags,
            ...feeFlag(fees),
            ...awaitConfirmationFlag,
            ...senderAccountFlag(),
            ...passphraseFlag,
            ...secondPassphraseFlag,
        };
    }

    /**
     * Return true if a second wallet passphrase is needed
     */
    public async hasSecondPassphrase(passphrase: string): Promise<boolean> {
        const cryptoAccountAddress: string = Identities.Address.fromPassphrase(passphrase);
        return this.applyWalletPredicate(cryptoAccountAddress, wallet => wallet && !!wallet.secondPublicKey);
    }

    /**
     * Get wallet with recipientId, apply predicate and returns result
     * @param recipientId
     * @param predicate
     */
    public async applyWalletPredicate(recipientId: string, predicate: (wallet: Wallet) => boolean) {
        try {
            const wallet: Wallet & { chainmeta: ChainMeta } = await this.unsClientWrapper.getWallet(recipientId);
            return predicate(wallet);
        } catch (e) {
            if (e instanceof HttpNotFoundError) {
                this.info(`Wallet ${recipientId} not found.`);
                return false;
            }
            throw e;
        }
    }

    public async askForPassphrases(
        flags: Record<string, any>,
        checkSecondPassphrase = true,
    ): Promise<CryptoAccountPassphrases> {
        let passphrase: string = flags.passphrase;
        let secondPassphrase: string = flags["second-passphrase"];

        if (!passphrase) {
            passphrase = await getPassphraseFromUser();
        }
        checkPassphraseFormat(passphrase);

        if (checkSecondPassphrase) {
            if (!secondPassphrase && (await this.hasSecondPassphrase(passphrase))) {
                secondPassphrase = await getSecondPassphraseFromUser();
            }
            if (secondPassphrase) {
                checkPassphraseFormat(secondPassphrase);
            }
        }

        return { first: passphrase, second: secondPassphrase };
    }

    public checkIfAwaitIsNeeded(flags: Record<string, any>, transactionId: string): boolean {
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

    public async awaitConfirmations(
        flags: Record<string, any>,
        transactionId: string,
    ): Promise<(Transaction & { chainmeta: ChainMeta; confirmations: number }) | undefined> {
        /**
         * Wait for the first transaction confirmation
         */
        this.actionStart("Waiting for transaction confirmation");
        const transactionFromNetwork = await this.waitTransactionConfirmations(
            this.unsClientWrapper.getBlockTime(),
            transactionId,
            flags["await-confirmation"],
            1,
        );
        this.actionStop();

        return transactionFromNetwork;
    }

    public async broadcastTransaction(transaction: Interfaces.ITransactionData) {
        this.info("Broadcast transaction %o", transaction);
        /**
         * Transaction broadcast
         */
        this.actionStart("Sending transaction");
        const sendResponse = await this.unsClientWrapper.sendTransaction(transaction);
        this.actionStop();
        if (sendResponse.errors) {
            throw new Error(sendResponse.errors);
        }
    }
}
