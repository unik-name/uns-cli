import { Interfaces, Utils } from "@uns/ark-crypto";
import { NestedCommandOutput } from "./formater";
import { CryptoAccountPassphrases } from "./types";
import { isTokenId, resolveUnikName } from "./utils";
import { WriteCommand } from "./writeCommand";

export abstract class AbstractDelegateCommand extends WriteCommand {
    public static flags = {
        ...AbstractDelegateCommand.getFlags(),
    };

    protected static getFlags() {
        const flags = WriteCommand.flags;
        delete flags.senderAccount;
        return flags;
    }

    protected abstract getTransaction(
        unikid: string,
        fees: number,
        nonce: string,
        passphrase: string,
        secondPassphrase: string,
    ): Interfaces.ITransactionData;

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<NestedCommandOutput> {
        let ownerAddress: string;
        let unikid: string;
        if (isTokenId(args.id)) {
            unikid = args.id;
            ownerAddress = (await this.unsClientWrapper.getUnikById(unikid)).ownerId;
        } else {
            const resolved = await resolveUnikName(args.id, flags);
            if (resolved.error) {
                throw resolved.error;
            }
            unikid = resolved?.data.unikid;
            ownerAddress = resolved?.data.ownerAddress;
        }

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

        await this.broadcastTransaction(transactionStruct);

        if (!this.checkIfAwaitIsNeeded(flags, transactionStruct.id)) {
            return {
                data: {
                    transaction: transactionStruct.id,
                },
            };
        }

        const transactionFromNetwork = await this.awaitConfirmations(flags, transactionStruct.id);

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
