import { AbstractDelegateVoteCreateCommand } from "../../abstract-vote";
import { BaseCommand } from "../../baseCommand";
import { getNetworksListListForDescription } from "../../utils";

export class DelegateUnvoteCreateCommand extends AbstractDelegateVoteCreateCommand {
    public static description = "Remove vote from a delegate with his Unikname or unikid";

    public static examples = [
        `$ uns delegate:unvote --network ${getNetworksListListForDescription()} DELEGATE
        --format {json|yaml} --verbose`,
    ];

    public static flags = {
        ...AbstractDelegateVoteCreateCommand.flags,
    };

    public static args = [
        {
            name: "id",
            description: "The Unikname between double quote, or the unikid of the delegate to unvote for.",
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
