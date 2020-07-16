import { Interfaces } from "@uns/ark-crypto";
import { createCertifiedNftUpdateTransaction, isError, NftFactoryServicesList, SdkResult } from "@uns/ts-sdk";
import { CryptoAccountPassphrases } from "types";
import { CommandOutput } from "./formater";
import { getTargetArg, NFT_NAME } from "./utils";
import { WriteCommand } from "./writeCommand";
export abstract class PropertiesUpdateCommand extends WriteCommand {
    protected static getUpdateCommandFlags(fees?: number) {
        return WriteCommand.getWriteCommandFlags(false, fees);
    }

    protected static getUpdateCommandArgs() {
        return [getTargetArg()];
    }

    protected abstract async getProperties(
        flags: Record<string, any>,
        unikid: string,
    ): Promise<{ [_: string]: string }>;

    protected getServiceId(_: Record<string, any>): NftFactoryServicesList | undefined {
        return;
    }
    protected async generatePackage(_: string, __: string, ___: Record<string, any>): Promise<any> {
        return;
    }

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<CommandOutput> {
        const { unikid } = await this.targetResolve(flags, args.target);

        const properties = await this.getProperties(flags, unikid);

        const passphrases: CryptoAccountPassphrases = await this.askForPassphrases(flags);

        /**
         * Read emitter's wallet nonce
         */
        const nonce = await this.getNextWalletNonceFromPassphrase(passphrases.first);

        // Update transaction

        const transactionStruct: SdkResult<Interfaces.ITransactionData> = await createCertifiedNftUpdateTransaction(
            this.unsClientWrapper.unsClient,
            unikid,
            properties,
            flags.fee,
            nonce,
            passphrases.first,
            passphrases.second,
            NFT_NAME,
            this.getServiceId(flags),
            // Add unikname here if update service needs it
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
