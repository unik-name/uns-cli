import { flags } from "@oclif/command";
import { ChainMeta, Token, Wallet } from "@uns/ts-sdk";
import { BaseCommand } from "../../baseCommand";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../../formater";
import { ReadCommand } from "../../readCommand";
import { WithChainmeta } from "../../types";
import { fromSatoshi, getChainContext, getWalletAddress } from "../../utils";

export class CryptoAccountReadCommand extends ReadCommand {
    public static description = "Read current data of a specified crypto account, ic. balance";

    public static examples = ["$ uns cryptoaccount:read {publicKey|address} --listunik"];

    public static flags = {
        ...ReadCommand.flags,
        listunik: flags.boolean({ description: "List UNIK tokens owned by the crypto account, if any." }),
    };

    public static args = [
        {
            name: "cryptoAccountId",
            description:
                "The ID of the crypto account. Can be either the publicKey or the address (preferred) of the crypto account.",
            required: true,
        },
    ];

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return CryptoAccountReadCommand;
    }

    protected async do(flags: Record<string, any>, args?: Record<string, any>): Promise<NestedCommandOutput> {
        const walletId = await getWalletAddress(args?.cryptoAccountId, this.unsClientWrapper);

        // 'Destructuring + types' together 🤐
        // Not so pretty
        const [wallet, tokens]: [
            WithChainmeta<Wallet>,
            {
                data: Token[];
                chainmeta: ChainMeta;
            },
        ] = await Promise.all([
            this.unsClientWrapper.getWallet(walletId),
            this.unsClientWrapper.getWalletTokens(walletId),
        ]);

        this.checkDataConsistency(wallet.chainmeta.height, tokens.chainmeta.height);

        const data: NestedCommandOutput = {
            address: wallet.address,
            publicKey: wallet.publicKey,
            username: wallet.username,
            secondPublicKey: wallet.secondPublicKey,
            balance: fromSatoshi(wallet.balance),
            token: this.unsClientWrapper.getToken(),
            isDelegate: wallet.isDelegate,
            vote: wallet.vote,
            nfts: {
                unik: tokens.data.length,
            },
        };

        if (flags.listunik) {
            /**
             * LIST OF UNIK
             */
            this.log(`\nLIST OF UNIK:${tokens.data.length === 0 ? " none" : ""}`);
            if (tokens.data.length > 0) {
                tokens.data.forEach((tokenProps) => {
                    this.logAttribute("unikid", tokenProps.id);
                });
            }
            data.tokens = {
                unik: tokens.data.map((t) => t.id),
            };
        }

        return {
            data,
            ...(flags.chainmeta
                ? getChainContext(
                      wallet.chainmeta,
                      this.unsClientWrapper.unsClient.configuration.network,
                      this.unsClientWrapper.getCurrentNode(),
                  )
                : {}),
        };
    }
}
