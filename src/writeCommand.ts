import { crypto, KeyPair } from "@uns/crypto";
import { BaseCommand } from "./baseCommand";
import { HttpNotFoundError } from "./errorHandler";
import { feeFlag } from "./utils";

export abstract class WriteCommand extends BaseCommand {
    public static flags = {
        ...BaseCommand.baseFlags,
        ...feeFlag(),
    };

    /**
     * Return true if a second wallet passphrase is needed
     */
    protected async isSecondPassphraseNeeded(passphrase: string): Promise<boolean> {
        const keys: KeyPair = crypto.getKeys(passphrase);
        try {
            const wallet = await this.api.getWallet(keys.publicKey);
            return wallet && !!wallet.secondPublicKey;
        } catch (e) {
            if (e instanceof HttpNotFoundError) {
                this.debug(`Wallet ${keys.publicKey} not found.`);
                return false;
            }
            throw e;
        }
    };
}
