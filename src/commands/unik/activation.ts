import { BaseCommand } from "../../baseCommand";
import { CommandOutput, Formater, OUTPUT_FORMAT } from "../../formater";
import { PropertiesUpdateCommand } from "../../updatePropertiesCommand";
import { LIFE_CYCLE_PROPERTY_KEY, LifeCycleGrades, NftFactoryServicesList } from "@uns/ts-sdk";
import { Managers } from "@uns/ark-crypto";

export class UnikActivationCommand extends PropertiesUpdateCommand {
    public static description = "Sandbox @unikname activation.";

    public static examples = ["$ unikname unik:activation @bob -n sandbox"];

    public static flags = PropertiesUpdateCommand.getUpdateCommandFlags();

    public static args = PropertiesUpdateCommand.getUpdateCommandArgs();

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return UnikActivationCommand;
    }

    protected async getServiceId(_: Record<string, any>, unikid: string): Promise<NftFactoryServicesList | undefined> {
        const unikType = await this.getUnikType(unikid);
        switch (unikType) {
            case "INDIVIDUAL":
                return NftFactoryServicesList.NFT_FACTORY_UPDATE_ALIVE_INDIVIDUAL;
            case "ORGANIZATION":
                return NftFactoryServicesList.NFT_FACTORY_UPDATE_ALIVE_ORGANIZATION;
            case "NETWORK":
                return NftFactoryServicesList.NFT_FACTORY_UPDATE_ALIVE_NETWORK;
        }
    }

    protected async getProperties(_: Record<string, any>): Promise<{ [_: string]: string }> {
        return { [LIFE_CYCLE_PROPERTY_KEY]: LifeCycleGrades.LIVE.toString() };
    }

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<CommandOutput> {
        if (flags.network !== "sandbox") {
            throw new Error("This command is available only on the SANDBOX network");
        }

        const { unikid } = await this.targetResolve(flags, args.target);
        const unikType = await this.getUnikType(unikid);

        if (unikType === "INDIVIDUAL") {
            flags.fee = Managers.configManager.getMilestone().voucherRewards?.individual?.forger || flags.fee;
        }

        return super.do(flags, args);
    }
}
