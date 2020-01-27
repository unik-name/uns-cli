import { AbstractDelegateVoteCreateCommand } from "../../abstract-vote";
import { BaseCommand } from "../../baseCommand";
import { getDelegateIdArgumentDescription, getNetworksListListForDescription } from "../../utils";

export class DelegateUnvoteCreateCommand extends AbstractDelegateVoteCreateCommand {
    public static description = "Remove vote from a delegate with his Unikname or unikid";

    public static examples = [
        `$ uns delegate:unvote --network ${getNetworksListListForDescription()} ID
        --format {json|yaml} --verbose`,
    ];

    public static flags = {
        ...AbstractDelegateVoteCreateCommand.flags,
    };

    public static args = [
        {
            name: "id",
            description: getDelegateIdArgumentDescription("unvote for"),
            required: true,
        },
    ];

    protected getCommand(): typeof BaseCommand {
        return DelegateUnvoteCreateCommand;
    }

    protected getVotes(delegatePublicKey: string): string[] {
        return [`-${delegatePublicKey}`];
    }
}
