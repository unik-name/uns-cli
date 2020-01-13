import { Interfaces } from "@uns/ark-crypto";
import { BaseCommand } from "baseCommand";
import { AbstractDelegateCommand } from "../../abstract-delegate";
import { createDelegateRegisterTransaction, getNetworksListListForDescription } from "./../../utils";

export abstract class DelegateRegisterCommand extends AbstractDelegateCommand {
    public static description = "Register a UNIK as delegate using Unikname or unikid";

    public static examples = [
        `$ uns delegate:register --network ${getNetworksListListForDescription()} DELEGATE
        --format {json|yaml} --verbose`,
    ];

    public static args = [
        {
            name: "id",
            description: "The Unikname between double quote, or the unikid to register as delegate.",
            required: true,
        },
    ];

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
