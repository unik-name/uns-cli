import { Interfaces, Utils } from "@uns/ark-crypto";
import { NestedCommandOutput } from "./formater";
import { CryptoAccountPassphrases } from "./types";
import { WriteCommand } from "./writeCommand";

export abstract class AbstractDelegateCommand extends WriteCommand {
    public static flags = {
        ...WriteCommand.getWriteCommandFlags(false),
    };

    protected abstract getTransaction(
        unikid: string,
        fees: number,
        nonce: string,
        passphrase: string,
        secondPassphrase: string,
    ): Interfaces.ITransactionData;

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<NestedCommandOutput> {
        const { ownerAddress, unikid } = await this.targetResolve(flags, args.target);
        const passphrases: CryptoAccountPassphrases = await this.askForPassphrases(flags);

        /**
         * Read unik owner wallet nonce
         */
        const nonce = Utils.BigNumber.make(await this.unsClientWrapper.getNonce(ownerAddress))
            .plus(1)
            .toString();

        /**
         * Transaction creation
         */
        this.actionStart("Creating transaction");

        const transactionStruct: Interfaces.ITransactionData = await this.getTransaction(
            unikid,
            flags.fee,
            nonce,
            passphrases.first,
            passphrases.second,
        );
        this.actionStop();

        if (!transactionStruct.id) {
            throw new Error("Transaction id can't be undefined");
        }

        const transactionFromNetwork = await this.sendAndWaitConfirmationsIfNeeded(transactionStruct, flags);

        if (!transactionFromNetwork) {
            const transactionUrl = `${this.unsClientWrapper.getExplorerUrl()}/transaction/${transactionStruct.id}`;
            this.error(
                `Transaction not found yet, the network can be slow. Check this url in a while: ${transactionUrl}`,
            );
        }

        return {
            data: {
                transaction: transactionStruct.id,
                confirmations: transactionFromNetwork ? transactionFromNetwork.confirmations : 0,
            },
        };
    }
}
