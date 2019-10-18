import { flags } from "@oclif/command";
import { ITransactionData } from "@uns/crypto";
import { BaseCommand } from "../baseCommand";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../formater";
import {
    createNFTTransferTransaction,
    getNetworksListListForDescription,
    getPassphraseFromUser,
    passphraseFlag,
    unikidFlag,
} from "../utils";
import { WriteCommand } from "../writeCommand";

export class TransferUnikCommand extends WriteCommand {
    public static description = "Transfer UNIK token";

    public static examples = [
        `$ uns transfer-unik --unikid {unikid} --network ${getNetworksListListForDescription()} --format {json|yaml}`,
    ];

    public static flags = {
        ...WriteCommand.flags,
        ...unikidFlag("Token id to read"),
        recipient: flags.string({
            description: "New owner (address or public key)",
            required: true,
        }),
        ...passphraseFlag,
    };

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return TransferUnikCommand;
    }

    protected async do(flags: Record<string, any>): Promise<NestedCommandOutput> {
        /**
         * Get passphrase
         */
        let passphrase = flags.passphrase;
        if (!passphrase) {
            passphrase = await getPassphraseFromUser();
        }

        /**
         * Transaction creation
         */
        this.actionStart("Creating transaction");
        const transaction: ITransactionData = createNFTTransferTransaction(
            this.client,
            flags.unikid,
            flags.recipient,
            flags.fee,
            passphrase,
            this.api.getVersion(),
        );
        this.actionStop();
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

        /**
         * Wait for the first transaction confirmation (2 blocktimes max)
         */
        this.actionStart("Waiting for transaction confirmation");
        const transactionFromNetwork = await this.waitTransactionConfirmations(
            this.api.getBlockTime(),
            transaction.id,
            1,
            1,
        );
        this.actionStop();

        /**
         * Result prompt
         */
        if (transactionFromNetwork) {
            this.log(
                `UNIK nft transferred:  ${transactionFromNetwork.confirmations} confirmation${
                    transactionFromNetwork.confirmations > 0 ? "s" : ""
                }`,
            );

            const tokenUrl = `${this.api.getExplorerUrl()}/uniks/${flags.unikid}`;
            this.log(`UNIK nft in UNS explorer: ${tokenUrl}`);
            this.log(`New Owner ${flags.recipient}`);
        } else {
            this.error(
                `Transaction not found yet, the network can be slow. Check this url in a while: ${transactionUrl}`,
            );
        }
        return {
            data: {
                id: flags.unikid,
                newOwner: flags.recipient,
                transaction: transaction.id,
                confirmations: transactionFromNetwork.confirmations,
            },
        };
    }
}
