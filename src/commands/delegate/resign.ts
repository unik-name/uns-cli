import { Interfaces } from "@uns/ark-crypto";
import { BaseCommand } from "baseCommand";
import { AbstractDelegateCommand } from "../../abstract-delegate";
import { createDelegateResignTransaction, getNetworksListListForDescription } from "../../utils";

export abstract class DelegateResignCommand extends AbstractDelegateCommand {
    public static description = "Resign delegate registration of a UNIK or unikid";

    public static examples = [
        `$ uns delegate:resign --network ${getNetworksListListForDescription()} DELEGATE
        --format {json|yaml} --verbose`,
    ];

    public static args = [
        {
            name: "id",
            description: "The delegate Unikname between double quote, or the unikid to unregister.",
            required: true,
        },
    ];

    public static flags = {
        ...AbstractDelegateCommand.flags,
    };

    protected getCommand(): typeof BaseCommand {
        return DelegateResignCommand;
    }

    protected getTransaction(
        _: string,
        fees: number,
        nonce: string,
        passphrase: string,
        secondPassphrase: string,
    ): Interfaces.ITransactionData {
        return createDelegateResignTransaction(fees, nonce, passphrase, secondPassphrase);
    }
}
