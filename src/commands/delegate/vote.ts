import { Token } from "@uns/ts-sdk";
import { AbstractDelegateVoteCreateCommand } from "../../abstract-vote";
import { BaseCommand } from "../../baseCommand";
import { getDelegateArg } from "../../utils";

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
        const tokens = await this.unsClientWrapper.getWalletTokens(walletAddress);

        // Check tokens LifeCycle status
        const promises = tokens.data.map((token: Token) =>
            this.unsClientWrapper.getUnikProperty(token.id, "LifeCycle/Status"),
        );
        const reducer = (isAllowed: boolean, lifeStatus: any) => isAllowed && parseInt(lifeStatus.data) === 3 /*Alive*/;
        if (!tokens.data.length || !((await Promise.all(promises)) as string[]).reduce(reducer, true)) {
            throw new Error('Uniks of cryptoaccount have to be alive ("LifeCycle/Status" = 3) to vote.');
        }
    }
}
