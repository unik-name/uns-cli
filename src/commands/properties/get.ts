import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { ReadCommand } from "../../readCommand";
import {
    checkConfirmations,
    checkUnikPropertyFormat,
    confirmedFlag,
    getChainContext,
    getTargetArg,
    propertyKeyFlag,
} from "../../utils";

export class PropertiesGetCommand extends ReadCommand {
    public static description = "Get the value of a specific property of a UNIK token.";

    public static usage = "properties:get TARGET --propertyKey {propertyKey}";

    public static examples = ["$ uns properties:get @bob -k {propertyKey} [--confirmed {number of confirmations}]"];

    public static flags = {
        ...ReadCommand.flags,
        ...confirmedFlag,
        ...propertyKeyFlag("Key of the property for which we query the value.", false),
    };

    public static args = [getTargetArg()];

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml, OUTPUT_FORMAT.raw];
    }

    protected getCommand(): typeof BaseCommand {
        return PropertiesGetCommand;
    }

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<any> {
        const { unikid } = await this.targetResolve(flags, args.target);

        const propertyKey = flags.propertyKey.trim();
        checkUnikPropertyFormat(propertyKey, false);

        const property: any = await this.unsClientWrapper.getUnikProperty(unikid, propertyKey, flags.chainmeta);

        checkConfirmations(property.confirmations, flags.confirmed);

        const propertyValue = property.data;

        if (flags.format === OUTPUT_FORMAT.raw.key) {
            return propertyValue;
        }

        return {
            data: {
                unikid,
                property: propertyKey,
                value: propertyValue,
                confirmations: property.confirmations,
            },
            ...(flags.chainmeta
                ? getChainContext(
                      property.chainmeta,
                      this.unsClientWrapper.unsClient.configuration.network,
                      this.unsClientWrapper.getCurrentNode(),
                  )
                : {}),
        };
    }
}
