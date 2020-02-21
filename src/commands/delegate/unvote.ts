import { AbstractDelegateVoteCreateCommand } from "../../abstract-vote";
import { BaseCommand } from "../../baseCommand";
import { getDelegateArg, getNetworksListListForDescription } from "../../utils";

export class DelegateUnvoteCreateCommand extends AbstractDelegateVoteCreateCommand {
    public static description = "Remove vote from a delegate with his @unikname or unikid";

    public static examples = [`$ uns delegate:unvote @bob -n ${getNetworksListListForDescription()}`];

    public static flags = {
        ...AbstractDelegateVoteCreateCommand.flags,
    };

    public static args = [getDelegateArg("unvote for")];

    protected getCommand(): typeof BaseCommand {
        return DelegateUnvoteCreateCommand;
    }

    protected getVotes(delegatePublicKey: string): string[] {
        return [`-${delegatePublicKey}`];
    }
}
