import { PropertyValue, ResponseWithChainMeta } from "@uns/ts-sdk";
import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { ReadCommand } from "../../readCommand";
import { checkConfirmations, checkUnikIdFormat, confirmedFlag, getChainContext } from "../../utils";

export class UnikIsDisclosedCommand extends ReadCommand {
    public static description = "Check if UNIK has one or more disclosed explicit values.";

    public static examples = [
        `$ uns unik:is-disclosed -n sandbox 636795fff13c8f2d2fd90f9aa124d7f583920fce83588895c917927ee522db3b`,
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
        return UnikIsDisclosedCommand;
    }

    protected async do(flags: Record<string, any>, args?: Record<string, any>): Promise<any> {
        const unikId = args?.unikid;
        checkUnikIdFormat(unikId);
        let property: ResponseWithChainMeta<PropertyValue> | undefined;
        let data;
        let chainmeta;
        try {
            property = (await this.unsClientWrapper.getUnikProperty(
                unikId,
                "explicitValues",
                flags.chainmeta,
            )) as ResponseWithChainMeta<PropertyValue>;

            if (!property.confirmations) {
                // Should never happen
                throw new Error("Unable to get confirmations");
            }

            checkConfirmations(property.confirmations, flags.confirmed);

            data = {
                unikid: unikId,
                isDisclosed: true,
                confirmations: property.confirmations,
            };
            chainmeta = property.chainmeta;
        } catch (error) {
            if (error.response.status === 404) {
                const unik = await this.unsClientWrapper.getUnikById(unikId);

                data = {
                    unikid: unikId,
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
            ...(flags.chainmeta
                ? getChainContext(
                      chainmeta,
                      this.unsClientWrapper.unsClient.currentEndpointsConfig.network,
                      this.unsClientWrapper.getCurrentNode(),
                  )
                : {}),
        };
    }
}
