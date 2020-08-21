import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { PropertiesUpdateCommand } from "../../updatePropertiesCommand";
import { NftFactoryServicesList, LIFE_CYCLE_PROPERTY_KEY, LifeCycleGrades } from "@uns/ts-sdk";

export class EverlastingCommand extends PropertiesUpdateCommand {
    public static description = "Buy Everlasting status for a @unikname.";

    public static examples = ["$ uns unik:everlasting @bob"];

    public static flags = PropertiesUpdateCommand.getUpdateCommandFlags();

    public static args = PropertiesUpdateCommand.getUpdateCommandArgs();

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return EverlastingCommand;
    }

    protected async getServiceId(_: Record<string, any>, unikid: string): Promise<NftFactoryServicesList | undefined> {
        const unikType = await this.getUnikType(unikid);
        switch (unikType) {
            case "INDIVIDUAL":
                return NftFactoryServicesList.NFT_FACTORY_EVERLASTING_INDIVIDUAL;
            case "ORGANIZATION":
                return NftFactoryServicesList.NFT_FACTORY_EVERLASTING_ORGANIZATION;
            case "NETWORK":
                return NftFactoryServicesList.NFT_FACTORY_EVERLASTING_NETWORK;
        }
    }

    protected async getProperties(_: Record<string, any>): Promise<{ [_: string]: string }> {
        return { [LIFE_CYCLE_PROPERTY_KEY]: LifeCycleGrades.EVERLASTING.toString() };
    }
}
