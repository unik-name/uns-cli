import { Identities } from "@uns/ark-crypto";
import { ChainMeta, Wallet } from "@uns/ts-sdk";
import { BaseCommand } from "./baseCommand";
import { HttpNotFoundError } from "./errorHandler";
import {
    awaitConfirmationFlag,
    checkPassphraseFormat,
    feeFlag,
    getPassphraseFromUser,
    getSecondPassphraseFromUser,
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
        };
    }

    /**
     * Return true if a second wallet passphrase is needed
     */
    public async hasSecondPassphrase(passphrase: string): Promise<boolean> {
        const pubkey: string = Identities.PublicKey.fromPassphrase(passphrase);
        return this.applyWalletPredicate(pubkey, wallet => wallet && !!wallet.secondPublicKey);
    }

    /**
     * Get wallet with recipientId, apply predicate and returns result
     * @param recipientId
     * @param predicate
     */
    public async applyWalletPredicate(recipientId: string, predicate: (wallet: Wallet) => boolean) {
        try {
            const wallet: Wallet & { chainmeta: ChainMeta } = await this.api.getWallet(recipientId);
            return predicate(wallet);
        } catch (e) {
            if (e instanceof HttpNotFoundError) {
                this.info(`Wallet ${recipientId} not found.`);
                return false;
            }
            throw e;
        }
    }

    public async askForPassphrases(flags: Record<string, any>): Promise<{ first: string; second: string }> {
        /**
         * Get passphrase
         */
        const passphrase: string = await this.getAndCheckPassphrase(flags);

        /**
         * Get second passphrase
         */
        let secondPassphrase: string = flags.secondPassphrase;

        if (!secondPassphrase && (await this.hasSecondPassphrase(passphrase))) {
            secondPassphrase = await getSecondPassphraseFromUser();
        }

        if (secondPassphrase) {
            checkPassphraseFormat(secondPassphrase);
        }

        return {
            first: passphrase,
            second: secondPassphrase,
        };
    }

    public async getAndCheckPassphrase(flags: Record<string, any>): Promise<string> {
        let passphrase: string = flags.passphrase;
        if (!passphrase) {
            passphrase = await getPassphraseFromUser();
        }

        checkPassphraseFormat(passphrase);
        return passphrase;
    }
}
