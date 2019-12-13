import { flags } from "@oclif/command";
import { Interfaces } from "@uns/ark-crypto";
import { BaseCommand } from "../../baseCommand";
import { EXPLICIT_VALUE_MAX_LENGTH } from "../../config";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../../formater";
import { getTypeValue, getUnikTypesList } from "../../types";
import { createNFTMintTransaction, getNetworksListListForDescription, passphraseFlag } from "../../utils";
import { WriteCommand } from "../../writeCommand";

export class UnikCreateCommand extends WriteCommand {
    public static description = "Create UNIK token";

    public static examples = [
        `$ uns unik:create --explicitValue {explicitValue} --type [${getUnikTypesList().join(
            "|",
        )}] --network ${getNetworksListListForDescription()} --format {json|yaml}`,
    ];

    public static flags = {
        ...WriteCommand.flags,
        explicitValue: flags.string({ description: "UNIK nft token explicit value", required: true }),
        type: flags.string({
            description: "UNIK nft type",
            required: true,
            options: getUnikTypesList(),
        }),
        ...passphraseFlag,
    };

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return UnikCreateCommand;
    }

    protected async do(flags: Record<string, any>): Promise<NestedCommandOutput> {
        if (flags.explicitValue.length > EXPLICIT_VALUE_MAX_LENGTH) {
            throw new Error(
                `Error computing  UNIK id. Too long explicitValue ([${flags.explicitValue.length}] max length: 100)`,
            );
        }

        const passphrases = await this.askForPassphrases(flags);

        /**
         * Compute Fingerprint
         */
        this.actionStart("Computing UNIK fingerprint");
        const tokenId = await this.api.computeTokenId(this.api.network.backend, flags.explicitValue, flags.type);
        this.actionStop();
        this.log(`unikid: ${tokenId}`);

        /**
         * Read emitter's wallet nonce
         */
        const nonce = await this.getNextWalletNonceFromPassphrase(passphrases.first);

        /**
         * Transaction creation
         */
        this.actionStart("Creating transaction");
        const transaction: Interfaces.ITransactionData = createNFTMintTransaction(
            tokenId,
            getTypeValue(flags.type),
            flags.fee,
            // this.networkHash,
            nonce,
            passphrases.first,
            passphrases.second,
        );
        this.actionStop();

        if (!transaction.id) {
            throw new Error("Transaction id can't be undefined");
        }

        this.log(`Transaction id: ${transaction.id}`);

        /**
         * Transaction broadcast
         */
        this.actionStart("Sending transaction");
        const sendResponse = await this.api.sendTransaction(transaction);
        this.actionStop();
        if (sendResponse.errors) {
            throw new Error(sendResponse.errors);
        }
        const transactionUrl = `${this.api.getExplorerUrl()}/transaction/${transaction.id}`;
        this.log(`Transaction in explorer: ${transactionUrl}`);

        const awaitConfirmation: number = flags["await-confirmation"];
        if (awaitConfirmation === 0) {
            this.info(`Transaction accepted by the network: ${transaction.id}`);
            this.warn(
                "Transaction not confirmed yet, still in the pool. Track status of the transaction in the chain explorer.",
            );
            return {
                data: {
                    id: tokenId,
                    transaction: transaction.id,
                },
            };
        }

        /**
         * Wait for the first transaction confirmation
         */
        this.actionStart("Waiting for transaction confirmation");
        const transactionFromNetwork = await this.waitTransactionConfirmations(
            this.api.getBlockTime(),
            transaction.id,
            flags["await-confirmation"],
            1,
        );
        this.actionStop();

        /**
         * Result prompt
         */
        if (transactionFromNetwork) {
            this.log(
                `UNIK nft forged:  ${transactionFromNetwork.confirmations} confirmation${
                    transactionFromNetwork.confirmations > 0 ? "s" : ""
                }`,
            );

            const tokenUrl = `${this.api.getExplorerUrl()}/uniks/${tokenId}`;
            this.log(`UNIK nft in UNS explorer: ${tokenUrl}`);
        } else {
            this.error(
                `Transaction not found yet, the network can be slow. Check this url in a while: ${transactionUrl}`,
            );
        }
        return {
            data: {
                id: tokenId,
                transaction: transaction.id,
                confirmations: transactionFromNetwork.confirmations,
            },
        };
    }
}