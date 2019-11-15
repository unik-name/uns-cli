import { Identities, Interfaces, Networks, Transactions } from "@uns/ark-crypto";
import { Builders, Transactions as NftTransactions } from "@uns/core-nft-crypto";
import {
    DiscloseExplicitTransaction,
    IDiscloseDemand,
    IDiscloseDemandCertification,
    UNSDiscloseExplicitBuilder,
} from "@uns/crypto";
import { ChainMeta } from "@uns/ts-sdk";
import cli from "cli-ux";
import * as urlModule from "url";

const NFT_NAME = "unik";

export const isDevMode = () => {
    return process.env.DEV_MODE === "true";
};

const getDisableNetworkList = (): string[] => {
    const networkList = ["unitnet", "mainnet", "testnet"];
    if (!isDevMode()) {
        networkList.push("dalinet");
    }
    return networkList;
};

const DISABLED_NETWORK_LIST = getDisableNetworkList();

export const getNetworksList = (): string[] => {
    return [...Object.keys(Networks).filter(network => !DISABLED_NETWORK_LIST.includes(network)), "local"];
};

export const getNetworksListListForDescription = (): string => {
    return `[${getNetworksList().join("|")}]`;
};

export const getNetwork = (unsConfig: any, customNodeUrl?: string): any => {
    const url = customNodeUrl ? urlModule.resolve(customNodeUrl, "/api/v2") : unsConfig.chain.url;
    return {
        url,
        backend: unsConfig.service.url,
    };
};

/**
 * Create NFTMint transaction structure
 * @param client
 * @param tokenId
 * @param passphrase
 */
export const createNFTMintTransaction = (
    tokenId: string,
    tokenType: string,
    fees: number,
    // networkHash: number,
    nonce: string,
    passphrase: string,
): Interfaces.ITransactionData => {
    Transactions.TransactionRegistry.registerTransactionType(NftTransactions.NftMintTransaction);
    return (
        new Builders.NftMintBuilder(NFT_NAME, tokenId)
            .properties({ type: tokenType })
            .fee(`${fees}`)
            // .network(networkHash)
            .nonce(nonce)
            .sign(passphrase)
            .getStruct()
    );
};

/**
 * Create NFTUpdate transaction structure
 * @param client
 * @param tokenId
 * @param properties
 * @param fees
 * @param passphrase
 */
export const createNFTUpdateTransaction = (
    tokenId: string,
    properties: { [_: string]: string },
    fees: number,
    // networkHash: number,
    nonce: string,
    passphrase: string,
): Interfaces.ITransactionData => {
    Transactions.TransactionRegistry.registerTransactionType(NftTransactions.NftUpdateTransaction);
    return (
        new Builders.NftUpdateBuilder(NFT_NAME, tokenId)
            .properties(properties)
            .fee(`${fees}`)
            // .network(networkHash)
            .nonce(nonce)
            .sign(passphrase)
            .getStruct()
    );
};

/**
 *
 * @param client Create transfer transaction structure
 * @param amount
 * @param fees
 * @param recipientId
 * @param passphrase
 * @param secondPassPhrase
 */
export function createTransferTransaction(
    amount: number,
    fees: number,
    recipientId: string,
    // networkHash: number,
    nonce: string,
    passphrase: string,
    secondPassPhrase?: string,
) {
    const builder = Transactions.BuilderFactory.transfer()
        .amount(`${amount}`)
        .fee(`${fees}`)
        // .network(networkHash)
        .nonce(nonce)
        .recipientId(recipientId)
        .sign(passphrase);

    if (secondPassPhrase) {
        builder.secondSign(secondPassPhrase);
    }

    return builder.getStruct();
}

export function createDiscloseTransaction(
    discloseDemand: IDiscloseDemand,
    discloseDemandCertification: IDiscloseDemandCertification,
    fees: number,
    // networkHash: number,
    nonce: string,
    passphrase: string,
    secondPassphrase?: string,
): Interfaces.ITransactionData {
    Transactions.TransactionRegistry.registerTransactionType(DiscloseExplicitTransaction);
    const builder = new UNSDiscloseExplicitBuilder()
        .fee(`${fees}`)
        // .network(networkHash)
        .nonce(nonce)
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

export function fromSatoshi(value: number): number {
    return value / 100000000;
}

export function toSatoshi(value: number): number {
    return Math.floor(value * 100000000);
}

export const checkConfirmations = (confirmations: number, expected: number) => {
    if (confirmations < expected) {
        throw new Error(`Not enough confirmations (expected: ${expected}, actual: ${confirmations})`);
    }
};

export function getWalletFromPassphrase(passphrase: string, network: any) {
    const pubKey = Identities.PublicKey.fromPassphrase(passphrase);
    const privKey = Identities.PrivateKey.fromPassphrase(passphrase);
    const address = Identities.Address.fromPassphrase(passphrase);
    return {
        address,
        publicKey: pubKey,
        privateKey: privKey,
        passphrase,
        network: network.name,
    };
}

export function getChainContext(chainmeta: ChainMeta, networkName: string, currentNode: string) {
    return {
        chainmeta: {
            network: networkName,
            node: currentNode,
            date: chainmeta.timestamp.human,
            height: chainmeta.height,
        },
    };
}

export function getUrlOrigin(urlString: string) {
    const url = new URL(urlString);
    return url.origin;
}
