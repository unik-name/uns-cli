import { ChainMeta } from "@uns/ts-sdk";
import { BaseCommand } from "../../baseCommand";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../../formater";
import { ReadCommand } from "../../readCommand";
import { getChainContext, getTargetArg } from "../../utils";

export class UnikReadCommand extends ReadCommand {
    public static description = "Display UNIK token informations";

    public static examples = ["$ uns unik:read @bob"];

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
            data: Array<{ [_: string]: string }>;
            chainmeta: ChainMeta;
        } = await this.unsClientWrapper.getUnikProperties(target.unikid);

        if (target.transactions === undefined) {
            target.transactions = (await this.unsClientWrapper.getUnikById(target.unikid)).transactions;
        }
        const creationTransaction = await this.unsClientWrapper.getTransaction(target.transactions.first.id);

        if (!creationTransaction) {
            throw new Error(`Error fetching transaction ${target.transactions.first.id}`);
        }

        this.checkDataConsistency(
            target.chainmeta.height,
            properties.chainmeta.height,
            creationTransaction.chainmeta.height,
        );

        const data = {
            id: target.unikid,
            ownerAddress: target.ownerAddress,
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
                      this.unsClientWrapper.unsClient.currentEndpointsConfig.network,
                      this.unsClientWrapper.getCurrentNode(),
                  )
                : {}),
        };
    }
}
