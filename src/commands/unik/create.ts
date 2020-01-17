import { flags } from "@oclif/command";
import { Interfaces } from "@uns/ark-crypto";
import { DIDType } from "@uns/ts-sdk";
import { BaseCommand } from "../../baseCommand";
import { EXPLICIT_VALUE_MAX_LENGTH } from "../../config";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../../formater";
import { CryptoAccountPassphrases, getTypeValue, getUnikTypesList } from "../../types";
import { createNFTMintTransaction, getNetworksListListForDescription } from "../../utils";
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

        const passphrases: CryptoAccountPassphrases = await this.askForPassphrases(flags);

        /**
         * Compute Fingerprint
         */
        this.actionStart("Computing UNIK fingerprint");
        const tokenId = await this.api.computeTokenId(flags.explicitValue, flags.type.toUpperCase() as DIDType, "UNIK");
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

        await this.broadcastTransaction(transaction);

        const transactionUrl = `${this.api.getExplorerUrl()}/transaction/${transaction.id}`;
        this.log(`Transaction in explorer: ${transactionUrl}`);

        if (!this.checkIfAwaitIsNeeded(flags, transaction.id)) {
            return {
                data: {
                    id: tokenId,
                    transaction: transaction.id,
                },
            };
        }

        const transactionFromNetwork = await this.awaitConfirmations(flags, transaction.id);

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
