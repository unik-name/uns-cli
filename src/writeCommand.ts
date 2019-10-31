import { crypto, KeyPair } from "@uns/crypto";
import { BaseCommand } from "./baseCommand";
import { HttpNotFoundError } from "./errorHandler";
import { feeFlag } from "./utils";

export abstract class WriteCommand extends BaseCommand {
    protected static getWriteCommandFlags(fees: number = 100000000) {
        return {
            ...BaseCommand.baseFlags,
            ...feeFlag(fees),
        };
    }

    /**
     * Return true if a second wallet passphrase is needed
     */
    protected async isSecondPassphraseNeeded(passphrase: string): Promise<boolean> {
        const keys: KeyPair = crypto.getKeys(passphrase);
        return this.applyWalletPredicate(keys.publicKey, wallet => wallet && !!wallet.secondPublicKey);
    }

    /**
     * Get wallet with recipientId, apply predicate and returns result
     * @param recipientId
     * @param predicate
     */
    protected async applyWalletPredicate(recipientId: string, predicate: (wallet) => boolean) {
        try {
            const wallet = await this.api.getWallet(recipientId);
            return predicate(wallet);
        } catch (e) {
            if (e instanceof HttpNotFoundError) {
                this.info(`Wallet ${recipientId} not found.`);
                return false;
            }
            throw e;
        }
    }
}
