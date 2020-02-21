import { flags } from "@oclif/parser";
import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { PropertiesUpdateCommand as UpdatePropertiesCommand } from "../../updatePropertiesCommand";
import { checkUnikPropertyFormat, getNetworksListListForDescription, isDevMode } from "../../utils";

const KEY_VALUE_SEPARATOR = ":";

export class PropertiesSetCommand extends UpdatePropertiesCommand {
    public static hidden = !isDevMode();

    public static description = "Set (add or update) properties of UNIK token.";

    public static examples = [
        `$ uns properties:set @bob -n ${getNetworksListListForDescription()}
        --properties "{key1}:{value1}" "{key2}:{value2}"`,
    ];

    public static flags = {
        ...UpdatePropertiesCommand.getUpdateCommandFlags(),
        properties: flags.string({
            description: `List of key/value to set as UNIK properties: "key1:value1" "key2:value2" (key must start with "usr/")`,
            required: true,
            multiple: true,
        }),
    };

    public static args = UpdatePropertiesCommand.getUpdateCommandArgs();

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return PropertiesSetCommand;
    }

    protected getProperties(flags: Record<string, any>): { [_: string]: string } {
        const properties: { [_: string]: string } = {};
        for (const prop of flags.properties) {
            const keyValue = prop.split(KEY_VALUE_SEPARATOR);
            if (keyValue.length !== 2) {
                throw new Error(`Property parsing error. Should match key:value ${prop}`);
            }
            const [key, value] = keyValue;
            const trimedKey = key.trim();
            checkUnikPropertyFormat(trimedKey);
            properties[trimedKey] = value;
        }
        return properties;
    }
}
