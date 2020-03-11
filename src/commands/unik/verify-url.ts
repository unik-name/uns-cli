import { flags as oFlags } from "@oclif/command";
import { NftFactoryServicesList, USER_PROPERTY_PREFIX } from "@uns/ts-sdk";
import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { PropertiesUpdateCommand } from "../../updatePropertiesCommand";
import { getNetworksListListForDescription } from "../../utils";

export class VerifyUrlCommand extends PropertiesUpdateCommand {
    public static description = "Set (add or update) URLs of UNIK token.";

    public static examples = [
        `$ uns unik:verify-url TARGET --url "{Url}" --url-name "{UrlName}" -n ${getNetworksListListForDescription()}`,
    ];

    public static flags = {
        ...PropertiesUpdateCommand.getUpdateCommandFlags(),
        url: oFlags.string({
            description: "url to verify then set as UNIK properties",
            required: true,
        }),
        ["url-name"]: oFlags.string({
            description: "url name to to verify then use as key for UNIK properties",
            required: true,
        }),
    };

    public static args = PropertiesUpdateCommand.getUpdateCommandArgs();

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return VerifyUrlCommand;
    }

    protected getServiceId(): NftFactoryServicesList | undefined {
        return NftFactoryServicesList.NFT_FACTORY_URL_VERIFICATION;
    }

    protected async getProperties(flags: Record<string, any>, targetId: string): Promise<{ [_: string]: string }> {
        const properties: { [_: string]: string } = {};

        const url: string = flags.url;
        const urlName: string = flags["url-name"];

        const userPropertyKey = `${USER_PROPERTY_PREFIX}URL/${urlName}`;
        const verifiedPropertyKey = `Verified/URL/${urlName}`;

        try {
            // if userPropertyKey exists, it has to be unset
            const userPropertyValue: string = (await this.unsClientWrapper.getUnikProperty(
                targetId,
                userPropertyKey,
                false,
            )) as string;
            if (userPropertyValue) {
                // @ts-ignore
                properties[userPropertyKey] = null; // Needs to be null!!
            }
        } catch (e) {
            // Nothing to do
        }
        properties[verifiedPropertyKey] = url;

        return properties;
    }
}