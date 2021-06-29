import { ChainMeta, NodeConfiguration, Transaction, Wallet } from "@uns/ts-sdk";
import { WithChainmeta } from "types";
import { BaseCommand } from "../baseCommand";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../formater";
import { ReadCommand } from "../readCommand";
import { fromSatoshi, getChainContext, getTargetArg } from "../utils";

export class UnikReadCommand extends ReadCommand {
    public static description = "Display UNIKNAME token information";

    public static examples = ["$ unikname read @bob"];

    public static flags = {
        ...ReadCommand.flags,
    };

    public static args = [getTargetArg()];

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return UnikReadCommand;
    }

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<NestedCommandOutput> {
        const target = await this.targetResolve(flags, args.target);

        const properties: {
            data: { [_: string]: string }[];
            chainmeta: ChainMeta;
        } = await this.unsClientWrapper.getUnikProperties(target.unikid);

        if (target.transactions === undefined) {
            target.transactions = (await this.unsClientWrapper.getUnikById(target.unikid)).transactions;
        }

        const [owner, creationTransaction, nodeConf]: [
            WithChainmeta<Wallet> | undefined,
            WithChainmeta<Transaction> | undefined,
            NodeConfiguration | undefined,
        ] = await Promise.all([
            this.unsClientWrapper.getWallet(target.ownerAddress),
            this.unsClientWrapper.getTransaction(target.transactions.first.id),
            this.unsClientWrapper.getNodeConfiguration(),
        ]);

        if (!creationTransaction) {
            throw new Error(`Error fetching transaction ${target.transactions.first.id}`);
        }

        if (!owner) {
            throw new Error(`Error fetching @unikname owner ${target.ownerAddress}`);
        }

        if (!nodeConf) {
            throw new Error(`Error fetching node configuration`);
        }

        this.checkDataConsistency(
            target.chainmeta.height,
            properties.chainmeta.height,
            creationTransaction.chainmeta.height,
        );

        const data = {
            id: target.unikid,
            owner: {
                address: owner.address,
                balance: fromSatoshi(owner.balance),
                token: nodeConf.symbol,
            },
            creationBlock: creationTransaction.blockId,
            creationTransaction: creationTransaction.id,
            creationDate: creationTransaction.timestamp.human,
            properties: properties.data,
        };

        return {
            data,
            ...(flags.chainmeta
                ? getChainContext(
                      target.chainmeta,
                      this.unsClientWrapper.unsClient.configuration.network,
                      this.unsClientWrapper.getCurrentNode(),
                  )
                : {}),
        };
    }
}
