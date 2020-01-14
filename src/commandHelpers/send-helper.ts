import { Identities, Interfaces } from "@uns/ark-crypto";
import { cli } from "cli-ux";
import { SendCommand } from "../commands/send";
import { createTransferTransaction, getUniknameWalletAddress } from "../utils";
import { CommandHelper } from "./command-helper";

export class SendCommandHelper extends CommandHelper<SendCommand> {
    public createTransactionStruct(
        cmd: SendCommand,
        satoAmount: number,
        satoFees: number,
        to: string,
        // networkHash: number,
        nonce: string,
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
            passphrase,
            secondPassphrase,
        );
        cmd.actionStop();
        return sendTransactionStruct;
    }

    public async sendAndWaitTransactionConfirmations(
        transaction: Interfaces.ITransactionData,
        nbRetry: number,
        nbConfirmations: number,
    ) {
        if (!transaction.id) {
            throw new Error("Transaction id can't be undefined");
        }

        this.cmd.actionStart("Sending transaction");
        const sendResponse = await this.cmd.unsClientWrapper.sendTransaction(transaction);
        this.cmd.actionStop();
        if (sendResponse.errors) {
            throw new Error(sendResponse.errors);
        }

        this.cmd.actionStart("Waiting for transaction confirmation");
        const transactionFromNetwork = await this.cmd.waitTransactionConfirmations(
            this.cmd.unsClientWrapper.getBlockTime(),
            transaction.id,
            nbRetry,
            nbConfirmations,
        );
        this.cmd.actionStop();
        return transactionFromNetwork;
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
            throw new Error("sato UNS amount has to be an integer");
        }

        return amount;
    }

    public async resolveWalletAddress(id: string, isRecipient: boolean = true): Promise<string> {
        let resolvedAddress: string;

        if (id && id.startsWith("@")) {
            try {
                resolvedAddress = await getUniknameWalletAddress(id, this.cmd.unsClientWrapper.network.name);
            } catch (e) {
                if (e && e.response && e.response.status === 404) {
                    throw new Error(`${isRecipient ? "Recipient" : "Sender"} @unik-name does not exist`);
                }
                throw new Error(`${isRecipient ? "Recipient" : "Sender"} @unik-name does not match expected format`);
            }
        } else {
            if (!Identities.Address.validate(id, this.cmd.unsClientWrapper.getVersion())) {
                try {
                    resolvedAddress = Identities.Address.fromPublicKey(id);
                } catch (_) {
                    throw new Error(`${isRecipient ? "Recipient" : "Sender"} address does not match expected format`);
                }
            } else {
                resolvedAddress = id;
            }
        }
        return resolvedAddress;
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

    /**
     * Check if wallet exists
     * @param walletAddress
     */
    public async checkWalletExistence(walletAddress: string): Promise<boolean> {
        return this.cmd.applyWalletPredicate(walletAddress, wallet => !!wallet);
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
