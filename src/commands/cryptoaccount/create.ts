import { BaseCommand } from "../../baseCommand";
import { CommandOutput, Formater, OUTPUT_FORMAT } from "../../formater";
import { generatePassphrase, getNetworksListListForDescription, getWalletFromPassphrase } from "../../utils";

export class CryptoAccountCreateCommand extends BaseCommand {
    public static description = "Create UNS Crypto Account";

    public static examples = [
        `$ uns cryptoaccount:create --network ${getNetworksListListForDescription()}
        --format {json|yaml} --verbose`,
    ];

    public static flags = {
        ...BaseCommand.baseFlags,
    };

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return CryptoAccountCreateCommand;
    }

    protected async do(): Promise<CommandOutput> {
        const passphrase = await generatePassphrase();
        const wallet = getWalletFromPassphrase(passphrase, this.api.network);

        // Do not use this.error. It throws error and close. {exit: 0} option closes too.
        this.warn("This information is not saved anywhere. You need to copy and save it by your own.");
        return wallet;
    }
}
