import { flags } from "@oclif/parser";
import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { PropertiesUpdateCommand } from "../../updatePropertiesCommand";
import {
    BADGE_PIONEER_KEY,
    NftFactoryServicesList,
    getCurrentPioneerBadge,
    UNSClient,
    BADGES_PREFIX,
} from "@uns/ts-sdk";

type BadgeConfig = {
    key: (input: string) => string;
    value: (client: UNSClient) => Promise<string | undefined>;
    input: RegExp;
    serviceId: number;
};
const badgesConfig: BadgeConfig[] = [
    {
        key: () => BADGE_PIONEER_KEY,
        value: (client) => getCurrentPioneerBadge(client),
        input: /pioneer/,
        serviceId: NftFactoryServicesList.NFT_FACTORY_BADGE_PIONEER,
    },
    {
        key: (input: string): string => `${BADGES_PREFIX}${input}`,
        value: () => Promise.resolve("true"),
        input: new RegExp(`^Event\/`, "ig"),
        serviceId: NftFactoryServicesList.NFT_FACTORY_EVENT_BADGE,
    },
];

export class BadgesClaimCommand extends PropertiesUpdateCommand {
    public static description = "Claim a Badge for a UNIK.";

    public static examples = ["$ uns badges:claim @bob --badge {badge name}"];

    public static flags = {
        ...PropertiesUpdateCommand.getUpdateCommandFlags(),
        badge: flags.string({
            description: `Badge name`,
            char: "b",
            required: true,
        }),
    };

    public static args = PropertiesUpdateCommand.getUpdateCommandArgs();

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return BadgesClaimCommand;
    }

    protected getServiceId(flags: Record<string, any>): Promise<NftFactoryServicesList | undefined> {
        const config = this.getBadgeConfig(flags.badge);
        let serviceId: NftFactoryServicesList | undefined;
        if (config) {
            serviceId = config.serviceId;
        }
        return Promise.resolve(serviceId);
    }

    private getBadgeConfig(input: string): BadgeConfig | undefined {
        return badgesConfig.filter((c) => input.match(c.input))[0];
    }

    protected async getProperties({ badge }: Record<string, any>): Promise<{ [_: string]: string }> {
        const config = this.getBadgeConfig(badge);
        if (config) {
            const value = await config.value(this.unsClientWrapper.unsClient);
            if (value) {
                return { [config.key(badge)]: value };
            } else {
                throw new Error(`Badge ${badge} is not available`);
            }
        } else {
            throw new Error(`Unknown badge ${badge}`);
        }
    }
}
