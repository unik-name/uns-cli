import { BaseCommand } from "../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../formater";
import { ReadCommand } from "../readCommand";
import {
    checkConfirmations,
    checkUnikIdFormat,
    checkUnikPropertyFormat,
    confirmedFlag,
    getNetworksListListForDescription,
    propertyKeyFlag,
    unikidFlag,
} from "../utils";

export class GetPropertyValueCommand extends ReadCommand {
    public static description = "Get the value of a specific property of a UNIK token.";

    public static examples = [
        `$ uns get-property-value --unikid {unikId} -k {propertyKey} [--confirmed {number of confirmations}]
        --network ${getNetworksListListForDescription()} --format {json|yaml|raw}`,
    ];

    public static flags = {
        ...ReadCommand.flags,
        ...unikidFlag("UNIK token id on which to get the property."),
        ...confirmedFlag,
        ...propertyKeyFlag("Key of the property for which we query the value.", false),
    };

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml, OUTPUT_FORMAT.raw];
    }

    protected getCommand(): typeof BaseCommand {
        return GetPropertyValueCommand;
    }

    protected async do(flags: Record<string, any>): Promise<any> {
        checkUnikIdFormat(flags.unikid);
        checkUnikPropertyFormat(flags.propertyKey);

        const property: any = await this.api.getUnikProperty(flags.unikid, flags.propertyKey, flags.chainmeta);

        checkConfirmations(property.confirmations, flags.confirmed);

        const propertyValue = property.data;

        if (flags.format === OUTPUT_FORMAT.raw.key) {
            return propertyValue;
        }

        return {
            data: {
                unikid: flags.unikid,
                property: flags.propertyKey,
                value: propertyValue,
                confirmations: property.confirmations,
            },
            ...(flags.chainmeta ? this.showContext(property.chainmeta) : {}),
        };
    }
}
