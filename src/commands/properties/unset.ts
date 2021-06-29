import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { PropertiesUpdateCommand } from "../../updatePropertiesCommand";
import { checkUnikPropertyFormat, propertyKeyFlag } from "../../utils";

export class PropertiesUnsetCommand extends PropertiesUpdateCommand {
    public static description = "Unset properties of UNIKNAME token.";

    public static usage = "properties:unset TARGET --propertyKey {propertyKey}";

    public static examples = ["$ unikname properties:unset @bob -k prop1 -k prop2"];

    public static flags = {
        ...PropertiesUpdateCommand.getUpdateCommandFlags(),
        ...propertyKeyFlag('Key of the property to unset. (multiple occurrences, key must start with "usr/")'),
    };

    public static args = PropertiesUpdateCommand.getUpdateCommandArgs();

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return PropertiesUnsetCommand;
    }

    protected async getProperties(flags: Record<string, any>): Promise<{ [_: string]: string }> {
        const properties: { [_: string]: string } = {};

        flags.propertyKey.forEach((prop: string) => {
            const propToUnset: string = prop.trim();
            checkUnikPropertyFormat(propToUnset);

            // @ts-ignore
            properties[propToUnset] = null; // Needs to be null!!
        });
        return properties;
    }
}
