import { Interfaces } from "@uns/ark-crypto";
import { BaseCommand } from "baseCommand";
import { AbstractDelegateCommand } from "../../abstract-delegate";
import {
    createDelegateRegisterTransaction,
    getDelegateIdArgumentDescription,
    getNetworksListListForDescription,
} from "./../../utils";

export abstract class DelegateRegisterCommand extends AbstractDelegateCommand {
    public static description = "Register a UNIK as delegate using Unikname or unikid";

    public static examples = [
        `$ uns delegate:register --network ${getNetworksListListForDescription()} ID
        --format {json|yaml} --verbose`,
    ];

    public static args = [
        {
            name: "id",
            description: getDelegateIdArgumentDescription("register as delegate"),
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
