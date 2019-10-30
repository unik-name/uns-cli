import { flags } from "@oclif/parser";

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

export const awaitFlag = {
    await: flags.integer({
        description: `Number of blocks to wait to get confirmed for the success. Default to 3.
          0 for immediate return.
          Needs to be strictly greater than --confirmation flag`,
        default: 3,
    }),
};

export const confirmationsFlag = {
    confirmations: flags.integer({
        description:
            "Number of confirmations to wait to get confirmed for the success. Default to 1.\n\t Needs to be strictly lower than --await flag",
        default: 1,
    }),
};

export const feeFlag = (defaultFee: number = 100000000): { [_: string]: flags.IOptionFlag<number> } => {
    return {
        fee: flags.integer({
            description: `Specify a dynamic fee in satoUNS. Defaults to ${defaultFee} (100000000 satoUNS = 1 UNS).`,
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
