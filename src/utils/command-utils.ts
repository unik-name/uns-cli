import { flags } from "@oclif/parser";
import { Client, crypto, ITransactionData, networks, DiscloseDemand, DiscloseDemandCertification } from "@uns/crypto";
import cli from "cli-ux";
import { NETWORKS } from "../config";

export const isDevMode = () => {
    return process.env.DEV_MODE === "true";
};

const getDisableNetworkList = (): string[] => {
    const networkList = ["unitnet", "mainnet", "testnet"];
    if (!this.isDevMode()) {
        networkList.push("dalinet");
    }
    return networkList;
};

const DISABLED_NETWORK_LIST = getDisableNetworkList();

export const getNetworksList = (): string[] => {
    return [...Object.keys(networks).filter(network => !DISABLED_NETWORK_LIST.includes(network)), "local"];
};

export const getNetworksListListForDescription = () => {
    return `[${this.getNetworksList().join("|")}]`;
};

export const getNetwork = (network: string): any => {
    return NETWORKS[network];
};

/**
 * Create NFTMint transaction structure
 * @param client
 * @param tokenId
 * @param passphrase
 * @param networkVerion
 */
export const createNFTMintTransaction = (
    client: Client,
    tokenId: string,
    tokenType: string,
    fee: number,
    passphrase: string,
    networkVerion: number,
): ITransactionData => {
    return client
        .getBuilder()
        .nftMint(tokenId)
        .properties({ type: tokenType })
        .fee(fee)
        .network(networkVerion)
        .sign(passphrase)
        .getStruct();
};

/**
 * Create NFTUpdate transaction structure
 * @param client
 * @param tokenId
 * @param properties
 * @param fees
 * @param networkVerion
 * @param passphrase
 */
export const createNFTUpdateTransaction = (
    client: Client,
    tokenId: string,
    properties: { [_: string]: string },
    fees: number,
    networkVerion: number,
    passphrase: string,
): ITransactionData => {
    return client
        .getBuilder()
        .nftUpdate(tokenId)
        .properties(properties)
        .fee(fees)
        .network(networkVerion)
        .sign(passphrase)
        .getStruct();
};

/**
 *
 * @param client Create transfer transaction structure
 * @param amount
 * @param fees
 * @param recipientId
 * @param networkVersion
 * @param passphrase
 * @param secondPassPhrase
 */
export function createTransferTransaction(
    client: Client,
    amount: number,
    fees: number,
    recipientId: string,
    networkVersion: number,
    passphrase: string,
    secondPassPhrase?: string,
) {
    const builder = client
        .getBuilder()
        .transfer()
        .amount(amount)
        .fee(fees)
        .network(networkVersion)
        .recipientId(recipientId)
        .sign(passphrase);

    if (secondPassPhrase) {
        builder.secondSign(secondPassPhrase);
    }

    return builder.getStruct();
}

export function createDiscloseTransaction(
    client: Client,
    discloseDemand: DiscloseDemand,
    discloseDemandCertification: DiscloseDemandCertification,
    fees: number,
    networkVerion: number,
    passphrase: string,
    secondPassphrase?: string,
): ITransactionData {
    const builder = client
        .getBuilder()
        .unsDiscloseExplicit()
        .fee(fees)
        .network(networkVerion)
        .discloseDemand(discloseDemand, discloseDemandCertification)
        .sign(passphrase);

    if (secondPassphrase) {
        builder.secondSign(secondPassphrase);
    }

    return builder.getStruct();
}

function promptHidden(text: string): Promise<string> {
    return cli.prompt(text, { type: "hide" });
}

export const getPassphraseFromUser = (): Promise<string> => {
    return promptHidden("Enter your wallet passphrase (12 words phrase)");
};

export const getSecondPassphraseFromUser = (): Promise<string> => {
    return promptHidden(
        "You have associated a second passphrase to your wallet. This second passphrase is needed to validate this transaction.\nPlease, enter it (12 words phrase)",
    );
};

export const checkUnikPropertyFormat = (propertyKey: string) => {
    const valid = propertyKey && propertyKey.match(/[a-zA-Z0-9]+/)[0] === propertyKey;
    if (!valid) {
        throw new Error(`Property ${propertyKey} does not match expected format`);
    }
};

export function fromSatoshi(value: number): number {
    return value / 100000000;
}

export function toSatoshi(value: number): number {
    return value * 100000000;
}

export const checkConfirmations = (confirmations: number, expected: number) => {
    if (confirmations < expected) {
        throw new Error(`Not enough confirmations (expected: ${expected}, actual: ${confirmations})`);
    }
};

export function getWalletFromPassphrase(passphrase: string, network: any) {
    const keys = crypto.getKeys(passphrase);
    const address = crypto.getAddress(keys.publicKey, network.version);
    return {
        address,
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        passphrase,
        network: network.name,
    };
}
