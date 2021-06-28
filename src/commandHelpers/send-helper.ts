import { Interfaces } from "@uns/ark-crypto";
import { cli } from "cli-ux";
import { SendCommand } from "../commands/unik/send";
import { createTransferTransaction } from "../utils";
import { CommandHelper } from "./command-helper";

export class SendCommandHelper extends CommandHelper<SendCommand> {
    public createTransactionStruct(
        cmd: SendCommand,
        satoAmount: number,
        satoFees: number,
        to: string,
        // networkHash: number,
        nonce: string,
        vendorField: string,
        passphrase: string,
        secondPassphrase?: string,
    ): Interfaces.ITransactionData {
        cmd.actionStart("Creating transaction");
        const sendTransactionStruct = createTransferTransaction(
            satoAmount,
            satoFees,
            to,
            // networkHash,
            nonce,
            vendorField,
            passphrase,
            secondPassphrase,
        );
        cmd.actionStop();
        return sendTransactionStruct;
    }

    public checkAndGetAmount(amountArg: string, isSatoAmount: boolean) {
        // Check amount
        const amountParts = amountArg.replace(" ", "").split(".");

        if (amountArg.includes(",") || amountParts.length > 2) {
            throw new Error("Please, only use a decimal point for the amount");
        }

        if (amountParts.length === 2 && amountParts[1].length > 8) {
            throw new Error(
                "The number of significant digits displayed after floating point numbers has to be lower or equal to 8",
            );
        }

        const amount = Number.parseFloat(amountArg);
        if (isNaN(amount) || amount <= 0) {
            throw new Error("The amount should be a positive number");
        }

        if (isSatoAmount && !Number.isInteger(amount)) {
            throw new Error("satoUNIK amount has to be an integer");
        }

        return amount;
    }

    public async checkAndConfirmWallet(checkWallet: boolean, address: string) {
        if (checkWallet) {
            this.cmd.actionStart("Check recipient existence");
            const exists = await this.checkWalletExistence(address);
            this.cmd.actionStop();
            if (!exists) {
                this.cmd.warn("The recipient address does not exist on chain yet");
                return await cli.confirm(`Do really want to send tokens to this wallet?`);
            }
        }
        return true;
    }

    public async confirmVendorField(checkText: boolean, text: string) {
        if (checkText && text) {
            this.cmd.warn(`Message to include in transaction: \"${text}\"`);
            return await cli.confirm(`Do really want to include this message in this transaction?`);
        }
        return true;
    }

    /**
     * Check if wallet exists
     * @param walletAddress
     */
    public async checkWalletExistence(walletAddress: string): Promise<boolean> {
        return this.cmd.applyWalletPredicate(walletAddress, (wallet) => !!wallet);
    }

    public formatOutput(transactionFromNetwork: any, transactionId: string) {
        if (!transactionFromNetwork) {
            this.cmd.error(
                `Transaction not found yet, the network can be slow. Check this url in a while: ${this.getTransactionUrl(
                    transactionId,
                )}`,
            );
        }

        return {
            transaction: transactionFromNetwork.id,
            confirmations: transactionFromNetwork.confirmations,
        };
    }

    public getTransactionUrl(transactionId: string) {
        return `${this.cmd.unsClientWrapper.getExplorerUrl()}/transaction/${transactionId}`;
    }
}
