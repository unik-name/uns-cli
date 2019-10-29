import { BaseCommand } from "../baseCommand";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../formater";
import { ReadCommand } from "../readCommand";
import {
    checkPassphraseFormat,
    getChainContext,
    getPassphraseFromUser,
    getWalletFromPassphrase,
    isPassphrase,
    isTokenId,
} from "../utils";

export class GetWalletAddressCommand extends ReadCommand {
    public static description = "Create UNS wallet";

    public static examples = [
        `$ uns get-wallet-address 5380aed31fde9cf6a07379bd450f5cc99c5da96a50bfe6db5ab7f117db3d2b53 --network devnet --format yaml --verbose`,
    ];

    public static flags = {
        ...ReadCommand.flags,
    };

    public static args = [
        {
            name: "id",
            description: "Either a unikid or a passphrase for which to get the wallet address.",
            required: false, // User can call command without argument, a passphrase should be asked with hidden input (no terminal history)
        },
    ];

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml, OUTPUT_FORMAT.raw];
    }

    protected getCommand(): typeof BaseCommand {
        return GetWalletAddressCommand;
    }

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<string | NestedCommandOutput> {
        let address: string;
        let publicKey: string;
        let chainMeta: any;
        if (isTokenId(args.id)) {
            // Get token
            const unik = await this.api.getUnikById(args.id);
            address = unik.ownerId;
            if (flags.format !== OUTPUT_FORMAT.raw.key) {
                // Get Wallet
                const wallet = await this.api.getWallet(address);
                publicKey = wallet.publicKey;
                chainMeta = wallet.chainmeta;
            }
        } else {
            let passphrase;
            if (args.id && !isPassphrase(args.id)) {
                throw new Error("ID argument does not match expected parameter");
            }
            passphrase = args.id;

            // Get Passphrase
            if (!passphrase) {
                passphrase = await getPassphraseFromUser();
            }
            checkPassphraseFormat(passphrase);

            const wallet = getWalletFromPassphrase(passphrase, this.api.network);
            address = wallet.address;
            publicKey = wallet.publicKey;
        }

        return formatOutput(
            flags.format,
            flags.chainmeta,
            address,
            publicKey,
            chainMeta,
            this.api.network.name,
            this.api.getCurrentNode(),
        );
    }
}

export function formatOutput(
    format: string,
    displayChainMeta: boolean,
    address: string,
    publicKey: string,
    chainMeta: any,
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

        if (displayChainMeta && chainMeta) {
            return {
                data,
                ...getChainContext(chainMeta, networkName, currentNode),
            };
        } else {
            return data;
        }
    }
}
