import { flags } from "@oclif/parser";
import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { PropertiesUpdateCommand } from "../../updatePropertiesCommand";
import { checkUnikPropertyFormat, getNetworksListListForDescription, isDevMode } from "../../utils";

export class PropertiesSetCommand extends PropertiesUpdateCommand {
    public static hidden = !isDevMode();

    public static description = "Set (add or update) properties of UNIK token.";

    public static examples = [
        `$ uns properties:set @bob -n ${getNetworksListListForDescription()}
        --key {key1} --value {value1} --key {key2} --value {value2}`,
    ];

    public static flags = {
        ...PropertiesUpdateCommand.getUpdateCommandFlags(),
        key: flags.string({
            char: "k",
            description: `List of key/value to set as UNIK properties: "key1:value1" "key2:value2" (key must start with "usr/")`,
            required: true,
            multiple: true,
        }),
        value: flags.string({
            char: "v",
            description: `List of key/value to set as UNIK properties: "key1:value1" "key2:value2" (key must start with "usr/")`,
            required: true,
            multiple: true,
        }),
    };

    public static args = PropertiesUpdateCommand.getUpdateCommandArgs();

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return PropertiesSetCommand;
    }

    protected async getProperties(flags: Record<string, any>): Promise<{ [_: string]: string }> {
        const properties: { [_: string]: string } = {};

        if (flags.key.length !== flags.value.length) {
            throw new Error(`Property parsing error. Should have --key and --value flags.`);
        }

        for (let i = 0; i < flags.key.length; i++) {
            const trimedKey = flags.key[i].trim();
            const trimedValue = flags.value[i].trim();
            checkUnikPropertyFormat(trimedKey);
            properties[trimedKey] = trimedValue;
        }
        return properties;
    }
}
