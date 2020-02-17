import { Interfaces } from "@uns/ark-crypto";
import { createCertifiedNftUpdateTransaction, isError, SdkResult } from "@uns/ts-sdk";
import { CryptoAccountPassphrases } from "types";
import { CommandOutput } from "./formater";
import { checkUnikIdFormat, NFT_NAME, unikidFlag } from "./utils";
import { WriteCommand } from "./writeCommand";
export abstract class PropertiesUpdateCommand extends WriteCommand {
    protected static getUpdateCommandFlags(fees?: number) {
        return {
            ...WriteCommand.getWriteCommandFlags(fees),
            ...unikidFlag("The UNIK token on which to update the properties."),
        };
    }

    protected abstract getProperties(flags: Record<string, any>): { [_: string]: string };

    protected async do(flags: Record<string, any>): Promise<CommandOutput> {
        // Check unikid format
        checkUnikIdFormat(flags.unikid);

        const properties = this.getProperties(flags);

        const passphrases: CryptoAccountPassphrases = await this.askForPassphrases(flags);

        /**
         * Read emitter's wallet nonce
         */
        const nonce = await this.getNextWalletNonceFromPassphrase(passphrases.first);

        // Update transaction

        const transactionStruct: SdkResult<Interfaces.ITransactionData> = await createCertifiedNftUpdateTransaction(
            this.unsClientWrapper.unsClient,
            flags.unikid,
            properties,
            flags.fee,
            nonce,
            passphrases.first,
            passphrases.second,
            NFT_NAME,
        );

        if (isError(transactionStruct)) {
            throw new Error(
                `${transactionStruct.message} ${transactionStruct.code ? ` (${transactionStruct.code})` : ""}`,
            );
        }

        if (!transactionStruct.id) {
            throw new Error("Transaction id can't be undefined");
        }

        this.log("Binding new propert" + (Object.keys(properties).length > 1 ? "ies" : "y") + " to UNIK.");
        const finalTransaction = await this.sendAndWaitConfirmationsIfNeeded(transactionStruct, flags);

        return {
            id: flags.unikid,
            transaction: transactionStruct.id,
            confirmations: finalTransaction ? finalTransaction.confirmations : 0,
        };
    }
}
