import { ChainMeta, DIDHelpers } from "@uns/ts-sdk";

export const getUnikTypesList = () => {
    return DIDHelpers.labels().map((type: string) => type.toLowerCase());
};

export type WithChainmeta<T> = T & { chainmeta: ChainMeta };

export interface CryptoAccountPassphrases {
    first: string;
    second: string;
}

export interface UnikInfos {
    unikid: string;
    ownerAddress: string;
    chainmeta: ChainMeta;
    transactions?: any;
}
