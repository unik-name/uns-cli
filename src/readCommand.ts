import { BaseCommand } from "./baseCommand";
import { chainmetaFlag } from "./utils";

export abstract class ReadCommand extends BaseCommand {
    public static flags = {
        ...BaseCommand.baseFlags,
        ...chainmetaFlag,
    };
}
