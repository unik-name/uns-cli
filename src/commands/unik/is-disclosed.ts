import { PropertyValue, ResponseWithChainMeta } from "@uns/ts-sdk";
import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { ReadCommand } from "../../readCommand";
import {
    checkConfirmations,
    confirmedFlag,
    getChainContext,
    getNetworksListListForDescription,
    getTargetArg,
} from "../../utils";

export class UnikIsDisclosedCommand extends ReadCommand {
    public static description = "Check if UNIK has one or more disclosed explicit values.";

    public static examples = [`$ uns unik:is-disclosed @bob -n ${getNetworksListListForDescription()}`];

    public static args = [getTargetArg()];

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

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<any> {
        const target = await this.targetResolve(flags, args.target);

        let property: ResponseWithChainMeta<PropertyValue> | undefined;
        let data;
        try {
            property = (await this.unsClientWrapper.getUnikProperty(
                target.unikid,
                "explicitValues",
                flags.chainmeta,
            )) as ResponseWithChainMeta<PropertyValue>;

            if (!property.confirmations) {
                // Should never happen
                throw new Error("Unable to get confirmations");
            }

            checkConfirmations(property.confirmations, flags.confirmed);

            data = {
                unikid: target.unikid,
                isDisclosed: true,
                confirmations: property.confirmations,
            };
            target.chainmeta = property.chainmeta;
        } catch (error) {
            if (error.response.status === 404) {
                data = {
                    unikid: target.unikid,
                    isDisclosed: false,
                };
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
                      target.chainmeta,
                      this.unsClientWrapper.unsClient.currentEndpointsConfig.network,
                      this.unsClientWrapper.getCurrentNode(),
                  )
                : {}),
        };
    }
}
