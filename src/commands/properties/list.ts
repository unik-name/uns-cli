import { BaseCommand } from "../../baseCommand";
import { CommandOutput, Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../../formater";
import { checkUnikIdFormat, confirmedFlag, getNetworksListListForDescription, unikidFlag } from "../../utils";

export class PropertiesListCommand extends BaseCommand {
    public static description = "Get properties of UNIK token.";

    public static examples = [
        `$ uns properties:list --unikid {unikId} [--confirmed {number of confirmations}]
        --network ${getNetworksListListForDescription()} --format {json|yaml|table|raw}`,
    ];

    public static flags = {
        ...BaseCommand.baseFlags,
        ...unikidFlag("The UNIK token on which to get the properties."),
        ...confirmedFlag,
    };

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml, OUTPUT_FORMAT.table, OUTPUT_FORMAT.raw];
    }

    protected getCommand(): typeof BaseCommand {
        return PropertiesListCommand;
    }

    protected async do(flags: Record<string, any>): Promise<NestedCommandOutput | CommandOutput[]> {
        checkUnikIdFormat(flags.unikid);

        const unik = await this.unsClientWrapper.getUnikById(flags.unikid);
        const lastTransaction = await this.unsClientWrapper.getTransaction(unik.transactions.last.id);

        if (!lastTransaction) {
            throw new Error(`Error fetching transaction ${unik.transactions.first.id}`);
        }

        const properties: any = await this.unsClientWrapper.getUnikProperties(flags.unikid);
        const lastUpdateHeight = lastTransaction.chainmeta.height;

        this.checkDataConsistency(unik.chainmeta.height, lastUpdateHeight, properties.chainmeta.height);

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
                    unikid: unik.id,
                    key: Object.keys(prop)[0],
                    value: Object.values(prop)[0],
                    confirmations: lastTransaction.confirmations,
                };
            });
        }

        return {
            unikid: unik.id,
            properties: properties.data,
            confirmations: lastTransaction.confirmations,
        };
    }
}
