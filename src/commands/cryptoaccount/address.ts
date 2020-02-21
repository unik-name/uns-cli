import { BaseCommand } from "../../baseCommand";
import { GetWalletAddressCommandHelper } from "../../commandHelpers/cryptoaccount_address-helper";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../../formater";
import { ReadCommand } from "../../readCommand";
import { getNetworksListListForDescription } from "../../utils";

export class CryptoAccountAddressCommand extends ReadCommand {
    public static description = "Get Crypto Account address";

    public static examples = [
        `$ uns cryptoaccount:address 5380aed31fde9cf6a07379bd450f5cc99c5da96a50bfe6db5ab7f117db3d2b53 -n ${getNetworksListListForDescription()}`,
    ];

    public static flags = {
        ...ReadCommand.flags,
    };

    public static args = [
        {
            name: "id",
            description: "Either a unikid or a passphrase for which to get the crypto account address.",
            required: false, // User can call command without argument, a passphrase should be asked with hidden input (no terminal history)
        },
    ];

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml, OUTPUT_FORMAT.raw];
    }

    protected getCommand(): typeof BaseCommand {
        return CryptoAccountAddressCommand;
    }

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<string | NestedCommandOutput> {
        const cmdHelper = new GetWalletAddressCommandHelper(this);

        const { address, publicKey, chainMeta } = await cmdHelper.getWalletInformations(
            args.id,
            flags.format,
            flags.chainmeta,
        );

        return cmdHelper.formatOutput(
            flags.format,
            address,
            publicKey,
            chainMeta,
            this.unsClientWrapper.unsClient.currentEndpointsConfig.network,
            this.unsClientWrapper.getCurrentNode(),
        );
    }
}
