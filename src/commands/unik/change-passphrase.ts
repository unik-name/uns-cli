import { WriteCommand } from "../../writeCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { getTargetArg } from "../../utils";
import { BaseCommand } from "../../baseCommand";
import { CryptoAccountPassphrases, WithChainmeta } from "types";
import { flags } from "@oclif/command";
import { Identities } from "@uns/ark-crypto";
import { cli } from "cli-ux";
import { ChainMeta, Token, Unik, Wallet, UnikTransferCertifiedTransactionBuildOptions } from "@uns/ts-sdk";
import { TransferCommand } from "../../abstract-transfer";

export class UnikChangePassphraseCommand extends TransferCommand {
    public static description = "Change UNS Crypto Account passphrase for an UNIK";

    public static examples = ["$ uns unik:change-passphrase"];

    public static args = [getTargetArg()];

    public static flags = {
        ...WriteCommand.flags,
        "new-passphrase": flags.string({
            description: "New passphrase",
        }),
        "new-second-passphrase": flags.string({
            description: "New second passphrase",
        }),
        yes: flags.boolean({
            char: "y",
            description: "Auto confirm all questions",
            default: false,
        }),
    };

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return UnikChangePassphraseCommand;
    }

    protected async getUnikTransferCertifiedTransactionBuildOptions(
        flags: Record<string, any>,
        args: Record<string, any>,
    ): Promise<UnikTransferCertifiedTransactionBuildOptions> {
        const { unikid, type, ownerAddress } = await this.targetResolve(flags, args.target);

        const passphrases: CryptoAccountPassphrases = await this.askForPassphrases(flags);

        const confirmTransfer: boolean = await this.cliConfirm(
            `Are you sure you want to change passphrase for ${unikid}`,
            flags.yes,
        );
        if (!confirmTransfer) {
            this.exit(0); // Normal exit
        }

        // check UNIK owner with pasphrase
        const cryptoAccountAddress: string = Identities.Address.fromPassphrase(passphrases.first);
        if (cryptoAccountAddress !== ownerAddress) {
            throw new Error("Your are not the owner of the UNIK");
        }

        // Check if owner is delegate
        this.actionStart("Checking origin (from) wallet");
        await this.checkDelegateStatus(ownerAddress, flags);
        this.actionStop();

        const newPassphrases: CryptoAccountPassphrases = await this.askForNewPassphrases(flags);

        const newCryptoAccountAddress: string = Identities.Address.fromPassphrase(newPassphrases.first);

        // Check new cryptoaccount address
        const newCryptoAccountAddressConfirmation: boolean = await this.cliConfirm(
            `Confirm NEW (to) cryptoaccount address: ${newCryptoAccountAddress}`,
            flags.yes,
        );
        if (!newCryptoAccountAddressConfirmation) {
            this.exit(0); // Normal exit
        }

        // Check if new owner is delegate
        this.actionStart("Checking NEW (to) wallet");
        if (!(await this.checkDelegateStatus(newCryptoAccountAddress, flags, true))) {
            this.exit(0); // Normal exit
        }

        // check that new cryptoaccount has no UNIK or UNIKs of same type that targetted UNIK
        const tokensResult: { data: Token[]; chainmeta: ChainMeta } = await this.unsClientWrapper.getWalletTokens(
            newCryptoAccountAddress,
        );
        const uniks: Unik[] = tokensResult.data.length
            ? await this.unsClientWrapper.getUniks(tokensResult.data.map((token) => token.id))
            : [];

        if (uniks.some((unik) => unik.type !== type)) {
            throw new Error("New cryptoaccount owns UNIK of different type than specified UNIK");
        }

        // Check orign cryptoaccount votes
        if (!(await this.checkOriginWalletVotes(cryptoAccountAddress, flags))) {
            this.exit(0); // Normal exit
        }

        /**
         * Read emitter's wallet nonce
         */
        const nonce = await this.getNextWalletNonceFromPassphrase(passphrases.first);
        this.actionStop();

        return {
            httpClient: this.unsClientWrapper.unsClient.http,
            unikId: unikid,
            recipientAddress: newCryptoAccountAddress,
            fees: flags.fee,
            nonce,
            passphrase: passphrases.first,
            secondPassPhrase: passphrases.second,
        };
    }

    private async checkDelegateStatus(
        walletAddress: string,
        flags: Record<string, any>,
        isTargetWallet: boolean = false,
    ): Promise<boolean> {
        const wallet: WithChainmeta<Wallet> | undefined = await this.unsClientWrapper.getSafeWallet(walletAddress);
        if (wallet?.isDelegate) {
            if (isTargetWallet) {
                if (wallet.isResigned) {
                    return await this.cliConfirm(
                        "The cryptoaccount of destination is resigned. You will not be able to register as delegate with this UNIK. Confirm transfert",
                        flags.yes,
                    );
                } else {
                    throw new Error("Transfer on cryptoaccount registered as delegate is not allowed");
                }
            } else if (!wallet.isResigned) {
                throw new Error(
                    `The cryptoaccount ${walletAddress} is delegate. You have to resign it before to change passphrase.`,
                );
            }
        }
        return true;
    }

    private async checkOriginWalletVotes(walletAddress: string, flags: Record<string, any>): Promise<boolean> {
        const wallet: WithChainmeta<Wallet> | undefined = await this.unsClientWrapper.getSafeWallet(walletAddress);
        if (!wallet || !wallet.vote) {
            return true;
        }
        if (wallet.attributes?.tokens?.length > 1) {
            return this.cliConfirm(
                `Remaining UNIK${
                    wallet.attributes?.tokens?.length > 2 ? "s" : ""
                } on your old cryptoaccount (${walletAddress}) will maintain their support but the transferred UNIK will not support any delegate. Confirm your transfer`,
                flags.yes,
            );
        } else {
            throw new Error("You have to withdraw your support before the tranfer of your UNIK");
        }
    }

    private async cliConfirm(message: string, bypass: boolean): Promise<boolean> {
        if (bypass) {
            return Promise.resolve(true);
        }

        return cli.confirm(`${message}? (y)`);
    }
}
