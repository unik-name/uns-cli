import { flags } from "@oclif/parser";
import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { PropertiesUpdateCommand } from "../../updatePropertiesCommand";
import { BADGE_PIONEER_KEY, NftFactoryServicesList, getCurrentPioneerBadge } from "@uns/ts-sdk";

const badges: Record<string, any> = {
    pioneer: { key: BADGE_PIONEER_KEY },
};

export class BadgesClaimCommand extends PropertiesUpdateCommand {
    public static description = "Claim a Badge for a UNIK.";

    public static examples = ["$ uns badges:claim @bob --badge {badge name}"];

    public static flags = {
        ...PropertiesUpdateCommand.getUpdateCommandFlags(),
        badge: flags.string({
            description: `Badge name`,
            char: "b",
            required: true,
            options: Object.keys(badges),
        }),
    };

    public static args = PropertiesUpdateCommand.getUpdateCommandArgs();

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return BadgesClaimCommand;
    }

    protected async getServiceId(_: Record<string, any>): Promise<NftFactoryServicesList | undefined> {
        return NftFactoryServicesList.NFT_FACTORY_BADGE_PIONEER;
    }

    protected async getProperties(flags: Record<string, any>): Promise<{ [_: string]: string }> {
        if (Object.keys(badges).includes(flags.badge)) {
            const value = await this.getBadgeValue(flags.badge);
            if (value) {
                return { [badges[flags.badge].key]: value };
            } else {
                throw new Error(`Badge ${flags.badge} is not available`);
            }
        } else {
            throw new Error(`Unknown badge ${flags.badge}`);
        }
    }

    private async getBadgeValue(badge: string): Promise<string | undefined> {
        switch (badge) {
            case "pioneer":
                return getCurrentPioneerBadge(this.unsClientWrapper.unsClient);
            default:
                return;
        }
    }
}
