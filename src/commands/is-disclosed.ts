import { BaseCommand } from "../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../formater";
import { ReadCommand } from "../readCommand";
import { checkConfirmations, checkUnikIdFormat, confirmedFlag, getChainContext } from "../utils";

export class IsDisclosedCommand extends ReadCommand {
    public static description = "Check if UNIK has one or more disclosed explicit values.";

    public static examples = [
        `$ uns is-disclosed -n devnet 636795fff13c8f2d2fd90f9aa124d7f583920fce83588895c917927ee522db3b`,
    ];

    public static args = [
        {
            name: "unikid",
            description: "The UNIK token to query",
            required: true,
        },
    ];

    public static flags = {
        ...ReadCommand.flags,
        ...confirmedFlag,
    };

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml, OUTPUT_FORMAT.raw];
    }

    protected getCommand(): typeof BaseCommand {
        return IsDisclosedCommand;
    }

    protected async do(flags: Record<string, any>, args?: Record<string, any>): Promise<any> {
        checkUnikIdFormat(args.unikid);
        let property;
        let data;
        let chainmeta;
        try {
            property = await this.api.getUnikProperty(args.unikid, "explicitValues", flags.chainmeta);
            checkConfirmations(property.confirmations, flags.confirmed);

            data = {
                unikid: args.unikid,
                isDisclosed: true,
                confirmations: property.confirmations,
            };
            chainmeta = property.chainmeta;
        } catch (error) {
            if (error.response.status === 404) {
                const unik = await this.api.getUnikById(args.unikid);

                data = {
                    unikid: args.unikid,
                    isDisclosed: false,
                };
                chainmeta = unik.chainmeta;
            } else {
                throw error;
            }
        }
        if (flags.format === OUTPUT_FORMAT.raw.key) {
            return property ? "1" : "0";
        }
        return {
            data,
            ...(flags.chainmeta ? getChainContext(chainmeta, this.api.network.name, this.api.getCurrentNode()) : {}),
        };
    }
}
