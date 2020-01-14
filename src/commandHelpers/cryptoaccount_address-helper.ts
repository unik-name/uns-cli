import { ChainMeta } from "@uns/ts-sdk";
import { CryptoAccountAddressCommand } from "../commands/cryptoaccount/address";
import { OUTPUT_FORMAT } from "../formater";
import {
    checkPassphraseFormat,
    getChainContext,
    getPassphraseFromUser,
    getWalletFromPassphrase,
    isPassphrase,
    isTokenId,
} from "../utils";
import { CommandHelper } from "./command-helper";

export class GetWalletAddressCommandHelper extends CommandHelper<CryptoAccountAddressCommand> {
    public async getWalletInformations(id: string, format: string, displayChainmeta: boolean) {
        let address: string;
        let publicKey: string | undefined;
        let chainMeta: ChainMeta | undefined;
        if (isTokenId(id)) {
            // Get token
            const unik = await this.cmd.unsClientWrapper.getUnikById(id);
            address = unik.ownerId;
            if (format !== OUTPUT_FORMAT.raw.key) {
                // Get Wallet
                const wallet = await this.cmd.unsClientWrapper.getWallet(address);
                publicKey = wallet.publicKey;
                if (displayChainmeta) {
                    chainMeta = wallet.chainmeta;
                }
            }
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
            address = wallet.address;
            publicKey = wallet.publicKey;
        }

        return {
            address,
            publicKey,
            chainMeta,
        };
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
}
