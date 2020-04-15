import { BaseCommand } from "../../baseCommand";
import { CommandOutput, Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../../formater";
import { confirmedFlag, getTargetArg } from "../../utils";

export class PropertiesListCommand extends BaseCommand {
    public static description = "Get properties of UNIK token.";

    public static examples = ["$ uns properties:list @bob [--confirmed {number of confirmations}]"];

    public static flags = {
        ...BaseCommand.baseFlags,
        ...confirmedFlag,
    };

    public static args = [getTargetArg()];

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml, OUTPUT_FORMAT.table, OUTPUT_FORMAT.raw];
    }

    protected getCommand(): typeof BaseCommand {
        return PropertiesListCommand;
    }

    protected async do(
        flags: Record<string, any>,
        args: Record<string, any>,
    ): Promise<NestedCommandOutput | CommandOutput[]> {
        const target = await this.targetResolve(flags, args.target);

        if (target.transactions === undefined) {
            target.transactions = (await this.unsClientWrapper.getUnikById(target.unikid)).transactions;
        }

        const lastTransaction = await this.unsClientWrapper.getTransaction(target.transactions.last.id);

        if (!lastTransaction) {
            throw new Error(`Error fetching transaction ${target.transactions.first.id}`);
        }

        const properties: any = await this.unsClientWrapper.getUnikProperties(target.unikid);
        const lastUpdateHeight = lastTransaction.chainmeta.height;

        this.checkDataConsistency(target.chainmeta.height, lastUpdateHeight, properties.chainmeta.height);

        if (lastTransaction.confirmations < flags.confirmed) {
            throw new Error(
                `Not enough confirmations (expected: ${flags.confirmed}, actual: ${lastTransaction.confirmations})`,
            );
        }

        if (flags.format === OUTPUT_FORMAT.raw.key) {
            return properties.data.reduce(
                (accumulator: { [_: string]: string }, currentValue: { [_: string]: string }) =>
                    Object.assign(accumulator, currentValue),
            );
        }

        if (flags.format === OUTPUT_FORMAT.table.key) {
            return properties.data.map((prop: { [_: string]: string }) => {
                return {
                    unikid: target.unikid,
                    key: Object.keys(prop)[0],
                    value: Object.values(prop)[0],
                    confirmations: lastTransaction.confirmations,
                };
            });
        }

        return {
            unikid: target.unikid,
            properties: properties.data,
            confirmations: lastTransaction.confirmations,
        };
    }
}
