import { Interfaces } from "@uns/ark-crypto";
import { Identities } from "@uns/ark-crypto";
import { Wallet } from "@uns/ts-sdk";
import { NestedCommandOutput } from "./formater";
import { CryptoAccountPassphrases, WithChainmeta } from "./types";
import { createVoteTransaction } from "./utils";
import { WriteCommand } from "./writeCommand";

export abstract class AbstractDelegateVoteCreateCommand extends WriteCommand {
    public static flags = {
        ...WriteCommand.getWriteCommandFlags(false),
    };

    protected abstract getVotes(delegatePublicKey: string): string[];
    protected abstract async throwIfNotAllowed(walletAddress: string): Promise<void>;

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<NestedCommandOutput> {
        // Get Delegate public key
        const delegatePublicKey: string = await this.resolveDelegateWalletPublicKey(flags, args.target);
        const passphrases: CryptoAccountPassphrases = await this.askForPassphrases(flags);

        await this.throwIfNotAllowed(Identities.Address.fromPassphrase(passphrases.first));

        /**
         * Read emitter's wallet nonce
         */
        const nonce = await this.getNextWalletNonceFromPassphrase(passphrases.first);

        /**
         * Transaction creation
         */
        this.actionStart("Creating transaction");
        const transactionStruct: Interfaces.ITransactionData = await createVoteTransaction(
            this.getVotes(delegatePublicKey),
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

    private async resolveDelegateWalletPublicKey(flags: Record<string, any>, delegateId: string): Promise<string> {
        const { ownerAddress } = await this.targetResolve(flags, delegateId);
        const wallet: WithChainmeta<Wallet> = await this.unsClientWrapper.getWallet(ownerAddress);

        if (!wallet) {
            throw new Error("Delegate not found");
        }

        if (!wallet.isDelegate) {
            throw new Error("This Unikname is not registered as delegate.");
        }

        return wallet.publicKey;
    }
}
