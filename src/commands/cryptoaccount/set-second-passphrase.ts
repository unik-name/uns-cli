import { CryptoAccountPassphrases } from "types";
import { BaseCommand } from "../../baseCommand";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../../formater";
import { createSecondPassphraseTransaction, generatePassphrase, getNetworksListListForDescription } from "../../utils";
import { WriteCommand } from "../../writeCommand";

export class CryptoAccountSetSecondPassphraseCommand extends WriteCommand {
    public static description = "Set Crypto Account second passphrase";

    public static examples = [`$ uns cryptoaccount:set-second-passphrase -n ${getNetworksListListForDescription()}`];

    public static flags = {
        ...CryptoAccountSetSecondPassphraseCommand.getFlags(),
    };

    protected static getFlags() {
        const flags = WriteCommand.flags;
        delete flags["second-passphrase"];
        return flags;
    }

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml, OUTPUT_FORMAT.raw];
    }

    protected getCommand(): typeof BaseCommand {
        return CryptoAccountSetSecondPassphraseCommand;
    }

    protected async do(flags: Record<string, any>): Promise<NestedCommandOutput> {
        const passphrase: CryptoAccountPassphrases = await this.askForPassphrases(flags, false);

        if (await this.hasSecondPassphrase(passphrase.first)) {
            throw new Error("A second passphrase already exists. Not possible to change it.");
        }

        const generatedSecondPassphrase: string = await generatePassphrase();

        /**
         * Read emitter's wallet nonce
         */
        const nonce = await this.getNextWalletNonceFromPassphrase(passphrase.first);

        /**
         * Transaction creation
         */
        this.actionStart("Creating transaction");
        const transactionStruct = createSecondPassphraseTransaction(
            flags.fee,
            nonce,
            passphrase.first,
            generatedSecondPassphrase,
        );
        this.actionStop();

        const transactionFromNetwork = await this.sendAndWaitConfirmationsIfNeeded(transactionStruct, flags);

        /**
         * Result prompt
         */
        if (!transactionFromNetwork) {
            const transactionUrl = `${this.unsClientWrapper.getExplorerUrl()}/transaction/${transactionStruct.id}`;
            this.warn(
                `Transaction not found yet, the network can be slow. Check this url in a while: ${transactionUrl}`,
            );
        }

        this.warn(
            "This information is not saved anywhere. You need to copy and save it by your own or you will lose your uns and UNIKs name.",
        );

        return {
            secondPassphrase: generatedSecondPassphrase,
            transaction: transactionStruct.id,
            confirmations: transactionFromNetwork?.confirmations || 0,
        };
    }
}
