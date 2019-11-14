import { ChainMeta, DIDHelpers, DIDType } from "@uns/ts-sdk";

export const getUnikTypesList = () => {
    return DIDHelpers.labels().map((type: string) => type.toLowerCase());
};

export const getTypeValue = (tokenType: string): string => {
    return `${DIDHelpers.fromLabel(tokenType.toUpperCase() as DIDType)}`;
};

export interface Token {
    id: string;
    ownerId: string;
}

export interface Transaction {
    id: string;
    blockId: string;
    version: number;
    type: number;
    amount?: number;
    fee: number;
    sender: string;
    recipient?: string;
    signature: string;
    confirmations: number;
    timestamp: {
        epoch: number;
        unix: number;
        human: string;
    };
}

export type WithChainmeta<T> = T & { chainmeta: ChainMeta };
