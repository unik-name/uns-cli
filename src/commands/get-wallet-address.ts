import { BaseCommand } from "../baseCommand";
import { GetWalletAddressCommandHelper } from "../commandHelpers/get-wallet-address-helper";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../formater";
import { ReadCommand } from "../readCommand";

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
            this.api.network.name,
            this.api.getCurrentNode(),
        );
    }
}
