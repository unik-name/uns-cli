import { Interfaces } from "@uns/ark-crypto";
import { BaseCommand } from "baseCommand";
import { AbstractDelegateCommand } from "../../abstract-delegate";
import { createDelegateRegisterTransaction, getDelegateArg } from "./../../utils";

export abstract class DelegateRegisterCommand extends AbstractDelegateCommand {
    public static description = "Register a @unikname as delegate using human value or unikid";

    public static examples = ["$ unikname delegate:register @bob"];

    public static args = [getDelegateArg("register as delegate")];

    public static flags = {
        ...AbstractDelegateCommand.flags,
    };

    protected getCommand(): typeof BaseCommand {
        return DelegateRegisterCommand;
    }

    protected getTransaction(
        unikid: string,
        fees: number,
        nonce: string,
        passphrase: string,
        secondPassphrase: string,
    ): Interfaces.ITransactionData {
        return createDelegateRegisterTransaction(unikid, fees, nonce, passphrase, secondPassphrase);
    }
}
