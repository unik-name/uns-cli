import { flags } from "@oclif/command";
import { UnikTransferCertifiedTransactionBuildOptions } from "@uns/ts-sdk";
import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { CryptoAccountPassphrases } from "../../types";
import { WriteCommand } from "../../writeCommand";
import { getTargetArg } from "../../utils";
import { TransferCommand } from "../../abstract-transfer";

export class UnikTransferCommand extends TransferCommand {
    public static description = "Transfer UNIK token";

    public static usage = "unik:transfer TARGET --to {recipient}";

    public static examples = [`$ uns unik:transfer TARGET --to {recipient}`];

    public static flags = {
        ...WriteCommand.getWriteCommandFlags(true),
        ["to"]: flags.string({
            char: "t",
            description: "Recipient cryptoaccount address",
            required: true,
        }),
    };

    public static args = [getTargetArg()];

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return UnikTransferCommand;
    }

    protected async getUnikTransferCertifiedTransactionBuildOptions(
        flags: Record<string, any>,
        args: Record<string, any>,
    ): Promise<UnikTransferCertifiedTransactionBuildOptions> {
        const recipientAddress: string = flags.to;

        const unikId = (await this.targetResolve(flags, args.target)).unikid;

        const passphrases: CryptoAccountPassphrases = await this.askForPassphrases(flags);

        /**
         * Read emitter's wallet nonce
         */
        const nonce = await this.getNextWalletNonceFromPassphrase(passphrases.first);

        /**
         * Transaction creation
         */
        return {
            httpClient: this.unsClientWrapper.unsClient.http,
            unikId,
            recipientAddress,
            fees: flags.fee,
            nonce,
            passphrase: passphrases.first,
            secondPassPhrase: passphrases.second,
        };
    }
}
