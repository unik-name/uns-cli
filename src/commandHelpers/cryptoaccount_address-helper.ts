import { ChainMeta } from "@uns/ts-sdk";
import { CryptoAccountAddressCommand } from "../commands/cryptoaccount/address";
import { OUTPUT_FORMAT } from "../formater";
import {
    checkPassphraseFormat,
    getChainContext,
    getPassphraseFromUser,
    getWalletFromPassphrase,
    isDid,
    isPassphrase,
    isTokenId,
    resolveUnikName,
} from "../utils";
import { CommandHelper } from "./command-helper";

export class GetWalletAddressCommandHelper extends CommandHelper<CryptoAccountAddressCommand> {
    public async getWalletInformations(
        id: string,
        format: string,
        displayChainmeta: boolean,
    ): Promise<{ address: string; publicKey: string | undefined; chainMeta: ChainMeta | undefined }> {
        let address: string;
        if (isTokenId(id)) {
            // Get token
            const unik = await this.cmd.unsClientWrapper.getUnikById(id);
            address = unik.ownerId;
            return await this.getWalletInfosFromAddress(address, displayChainmeta, format);
        } else if (isDid(id)) {
            const resolved = await resolveUnikName(id, { network: this.cmd.unsClientWrapper.network.name });
            if (resolved.error) {
                throw resolved.error;
            }
            return this.getWalletInfosFromAddress(resolved?.data.ownerAddress, displayChainmeta, format);
        } else {
            let passphrase;
            if (id && !isPassphrase(id)) {
                throw new Error("ID argument does not match expected parameter");
            }
            passphrase = id;

            // Get Passphrase
            if (!passphrase) {
                passphrase = await getPassphraseFromUser();
            }
            checkPassphraseFormat(passphrase);

            const wallet = getWalletFromPassphrase(passphrase, this.cmd.unsClientWrapper.network);
            return {
                address: wallet.address,
                publicKey: wallet.publicKey,
                chainMeta: undefined,
            };
        }
    }

    public formatOutput(
        format: string,
        address: string,
        publicKey: string | undefined,
        chainMeta: ChainMeta | undefined,
        networkName: string,
        currentNode: string,
    ) {
        if (format === OUTPUT_FORMAT.raw.key) {
            return address;
        } else {
            const data = {
                address,
                publicKey,
            };

            if (chainMeta) {
                return {
                    data,
                    ...getChainContext(chainMeta, networkName, currentNode),
                };
            } else {
                return data;
            }
        }
    }

    private async getWalletInfosFromAddress(address: string, displayChainmeta: boolean, format: string) {
        let publicKey;
        let chainMeta;
        if (format !== OUTPUT_FORMAT.raw.key) {
            // Get Wallet
            const wallet = await this.cmd.unsClientWrapper.getWallet(address);
            publicKey = wallet.publicKey;
            if (displayChainmeta) {
                chainMeta = wallet.chainmeta;
            }
        }

        return {
            address,
            publicKey,
            chainMeta,
        };
    }
}
