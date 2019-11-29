import { CommandOutput } from "./formater";
import {
    checkPassphraseFormat,
    checkUnikIdFormat,
    createNFTUpdateTransaction,
    getPassphraseFromUser,
    passphraseFlag,
    unikidFlag,
} from "./utils";
import { WriteCommand } from "./writeCommand";

export abstract class UpdateProperties extends WriteCommand {
    protected static getUpdateCommandFlags(fees?: number) {
        return {
            ...WriteCommand.getWriteCommandFlags(fees),
            ...unikidFlag("The UNIK token on which to update the properties."),
            ...passphraseFlag,
        };
    }

    protected abstract getProperties(flags: Record<string, any>): { [_: string]: string };

    protected async do(flags: Record<string, any>): Promise<CommandOutput> {
        // Check unikid format
        checkUnikIdFormat(flags.unikid);

        // Get passphrase
        let passphrase = flags.passphrase;
        if (!passphrase) {
            passphrase = await getPassphraseFromUser();
        }

        // Check passphrase format
        checkPassphraseFormat(passphrase);

        const properties = this.getProperties(flags);

        // Update transaction
        const transactionStruct = createNFTUpdateTransaction(
            flags.unikid,
            properties,
            flags.fee,
            this.api.getVersion(),
            passphrase,
        );

        if (!transactionStruct.id) {
            throw new Error("Transaction id can't be undefined");
        }

        this.log("Binding new propert" + (Object.keys(properties).length > 1 ? "ies" : "y") + " to UNIK.");
        const sendResult = await this.api.sendTransaction(transactionStruct);
        if (sendResult.errors) {
            throw new Error(`Transaction not accepted. Caused by: ${JSON.stringify(sendResult.errors)}`);
        }
        this.actionStart("Waiting for transaction confirmation");
        const finalTransaction = await this.waitTransactionConfirmations(
            this.api.getBlockTime(),
            transactionStruct.id,
            flags["await-confirmation"],
            1,
        );
        this.actionStop();

        return {
            id: flags.unikid,
            transaction: transactionStruct.id,
            confirmations: finalTransaction ? finalTransaction.confirmations : 0,
        };
    }
}
