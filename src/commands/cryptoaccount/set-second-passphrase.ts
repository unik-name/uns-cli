import { BaseCommand } from "../../baseCommand";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../../formater";
import { createSecondPassphraseTransaction, generatePassphrase } from "../../utils";
import { WriteCommand } from "../../writeCommand";

export class CryptoAccountSetSecondPassphraseCommand extends WriteCommand {
    public static description = "Set Crypto Account second passphrase";

    public static examples = [`$ uns cryptoaccount:set-second-passphrase --network sandbox`];

    public static flags = {
        ...WriteCommand.flags,
    };

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml, OUTPUT_FORMAT.raw];
    }

    protected getCommand(): typeof BaseCommand {
        return CryptoAccountSetSecondPassphraseCommand;
    }

    protected async do(flags: Record<string, any>): Promise<NestedCommandOutput> {
        const passphrase: string = await this.getAndCheckPassphrase(flags);

        if (await this.hasSecondPassphrase(passphrase)) {
            throw new Error("A second passphrase already exists. Not possible to change it.");
        }

        const generatedSecondPassphrase: string = await generatePassphrase();

        /**
         * Read emitter's wallet nonce
         */
        const nonce = await this.getNextWalletNonceFromPassphrase(passphrase);

        /**
         * Transaction creation
         */
        this.actionStart("Creating transaction");
        const transactionStruct = createSecondPassphraseTransaction(
            flags.fee,
            nonce,
            passphrase,
            generatedSecondPassphrase,
        );
        this.actionStop();

        if (!transactionStruct.id) {
            throw new Error("Transaction id can't be undefined");
        }

        /**
         * Transaction broadcast
         */
        this.actionStart("Sending transaction");
        const sendResponse = await this.api.sendTransaction(transactionStruct);
        this.actionStop();
        if (sendResponse.errors) {
            throw new Error(sendResponse.errors);
        }

        /**
         * Wait for the first transaction confirmation
         */
        this.actionStart("Waiting for transaction confirmation");
        const transactionFromNetwork = await this.waitTransactionConfirmations(
            this.api.getBlockTime(),
            transactionStruct.id,
            flags["await-confirmation"],
            1,
        );
        this.actionStop();

        /**
         * Result prompt
         */
        if (!transactionFromNetwork) {
            const transactionUrl = `${this.api.getExplorerUrl()}/transaction/${transactionStruct.id}`;
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
