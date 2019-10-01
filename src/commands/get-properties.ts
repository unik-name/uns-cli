import { flags } from "@oclif/command";
import { BaseCommand } from "../baseCommand";
import { CommandOutput, Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../formater";
import { confirmedFlag, getNetworksListListForDescription, unikidFlag } from "../utils";

export class GetPropertiesCommand extends BaseCommand {
    public static description = "Get properties of UNIK token.";

    public static examples = [
        `$ uns get-properties --unikid {unikId} [--confirmed {number of confirmations}]
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
        return GetPropertiesCommand;
    }

    protected getCommandTechnicalName(): string {
        return "get-properties";
    }

    protected async do(flags: Record<string, any>): Promise<NestedCommandOutput | CommandOutput[]> {
        const unik = await this.api.getUnikById(flags.unikid);
        const lastTransaction = await this.api.getTransaction(unik.transactions.last.id);
        const properties: any = await this.api.getUnikProperties(flags.unikid);
        const lastUpdateHeight = lastTransaction.chainmeta.height;

        this.checkDataConsistency(unik.chainmeta.height, lastUpdateHeight, properties.chainmeta.height);

        if (lastTransaction.confirmations < flags.confirmed) {
            throw new Error(
                `Not enough confirmations (expected: ${flags.confirmed}, actual: ${lastTransaction.confirmations})`,
            );
        }

        if (flags.format === OUTPUT_FORMAT.raw.key) {
            return properties.data.reduce((accumulator, currentValue) => Object.assign(accumulator, currentValue));
        }

        if (flags.format === OUTPUT_FORMAT.table.key) {
            return properties.data.map(prop => {
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
