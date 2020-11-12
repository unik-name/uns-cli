import { throwIfNotAllowedToVote } from "@uns/ts-sdk";
import { AbstractDelegateVoteCreateCommand } from "../../abstract-vote";
import { BaseCommand } from "../../baseCommand";
import { getDelegateArg } from "../../utils";
import { handleFetchError } from "../../errorHandler";

export class DelegateVoteCreateCommand extends AbstractDelegateVoteCreateCommand {
    public static description = "Vote for a delegate with his @unikname or unikid";

    public static examples = ["$ uns delegate:vote @bob"];

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

    protected async throwIfNotAllowed(walletAddress: string): Promise<void> {
        try {
            return throwIfNotAllowedToVote(this.unsClientWrapper.unsClient, walletAddress);
        } catch (e) {
            if (e.statusCode === 404 || e.response?.status === 404) {
                handleFetchError("wallet tokens", walletAddress)(e);
            }
            throw e;
        }
    }
}
