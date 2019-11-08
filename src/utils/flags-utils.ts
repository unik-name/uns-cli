import { flags } from "@oclif/parser";

const DEFAULT_COMMAND_FEES: number = 100000000;

export const passphraseFlag = {
    passphrase: flags.string({
        description:
            "The passphrase of the owner of UNIK. If you do not enter a passphrase you will be prompted for it.",
    }),
};

export const secondPassphraseFlag = {
    secondPassPhrase: flags.string({
        description:
            "The second wallet passphrase. If you have created a second passphrase on your wallet, you have to enter it.",
    }),
};

export const awaitConfirmationFlag = {
    "await-confirmation": flags.integer({
        description: `Maximum number of blocks to wait to get one confirmation of the transaction. Default to 3.
          0 for immediate return.`,
        default: 3,
    }),
};

export const feeFlag = (defaultFee: number = DEFAULT_COMMAND_FEES): { [_: string]: flags.IOptionFlag<number> } => {
    return {
        fee: flags.integer({
            description: `Specify a dynamic fee in satoUNS. Defaults to ${defaultFee} (100 000 000 satoUNS = 1 UNS).`,
            default: defaultFee,
        }),
    };
};

export const unikidFlag = (description?: string) => {
    return {
        unikid: flags.string({
            description,
            required: true,
        }),
    };
};

export const chainmetaFlag = {
    chainmeta: flags.boolean({
        description: "Retrieve chain meta data",
        default: false,
    }),
};

export const confirmedFlag = {
    confirmed: flags.integer({
        default: 3,
        description: "Minimum number of confirmation since the last update of the UNIK required to return the value.",
    }),
};

export const explicitValueFlag = (description: string, multiple: boolean = false) => {
    return {
        explicitValue: flags.string({
            char: "e",
            description,
            required: true,
            multiple,
        }),
    };
};

export const propertyKeyFlag = (description: string, multiple: boolean = true) => {
    return {
        propertyKey: flags.string({
            char: "k",
            description,
            required: true,
            multiple,
        }),
    };
};
