import { AbstractDelegateVoteCreateCommand } from "../../abstract-vote";
import { BaseCommand } from "../../baseCommand";
import { getDelegateArg, getNetworksListListForDescription } from "../../utils";

export class DelegateVoteCreateCommand extends AbstractDelegateVoteCreateCommand {
    public static description = "Vote for a delegate with his @unikname or unikid";

    public static examples = [`$ uns delegate:vote @bob -n ${getNetworksListListForDescription()}`];

    public static flags = {
        ...AbstractDelegateVoteCreateCommand.flags,
    };

    public static args = [getDelegateArg("vote for")];

    protected getCommand(): typeof BaseCommand {
        return DelegateVoteCreateCommand;
    }

    protected getVotes(delegatePublicKey: string): string[] {
        return [`+${delegatePublicKey}`];
    }
}
