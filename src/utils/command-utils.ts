import { Identities, Interfaces, Networks, Transactions } from "@uns/ark-crypto";
import { Builders, Transactions as NftTransactions } from "@uns/core-nft-crypto";
import {
    DelegateRegisterTransaction,
    DelegateResignTransaction,
    DiscloseExplicitTransaction,
    IDiscloseDemand,
    IDiscloseDemandCertification,
    UNSDelegateRegisterBuilder,
    UNSDelegateResignBuilder,
    UNSDiscloseExplicitBuilder,
    UNSVoteBuilder,
    VoteTransaction,
} from "@uns/crypto";
import { ChainMeta } from "@uns/ts-sdk";
import cli from "cli-ux";
import * as urlModule from "url";

export const NFT_NAME = "unik";

export const isDevMode = () => {
    return process.env.DEV_MODE === "true";
};

const getDisableNetworkList = (): string[] => {
    const networkList = ["unitnet", "mainnet", "testnet", "devnet"];
    if (!isDevMode()) {
        networkList.push("dalinet");
    }
    return networkList;
};

const DISABLED_NETWORK_LIST = getDisableNetworkList();

export const getNetworksList = (): string[] => {
    return [...Object.keys(Networks).filter(network => !DISABLED_NETWORK_LIST.includes(network))];
};

export const getNetwork = (unsConfig: any, customNodeUrl?: string): any => {
    const url = customNodeUrl ? urlModule.resolve(customNodeUrl, "/api/v2") : unsConfig.chain.url;
    return {
        url,
        backend: unsConfig.service.url,
    };
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
    nonce: string,
    passphrase: string,
    secondPassPhrase?: string,
): Interfaces.ITransactionData => {
    Transactions.TransactionRegistry.registerTransactionType(NftTransactions.NftUpdateTransaction);
    const builder = new Builders.NftUpdateBuilder(NFT_NAME, tokenId)
        .properties(properties)
        .fee(`${fees}`)
        .nonce(nonce)
        .sign(passphrase);

    if (secondPassPhrase) {
        builder.secondSign(secondPassPhrase);
    }
    return builder.getStruct();
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
    nonce: string,
    vendorField: string,
    passphrase: string,
    secondPassPhrase?: string,
) {
    const builder = Transactions.BuilderFactory.transfer()
        .amount(`${amount}`)
        .fee(`${fees}`)
        .nonce(nonce)
        .recipientId(recipientId)
        .vendorField(vendorField)
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
    nonce: string,
    passphrase: string,
    secondPassphrase?: string,
): Interfaces.ITransactionData {
    Transactions.TransactionRegistry.registerTransactionType(DiscloseExplicitTransaction);
    const builder = new UNSDiscloseExplicitBuilder()
        .fee(`${fees}`)
        .nonce(nonce)
        .discloseDemand(discloseDemand, discloseDemandCertification)
        .sign(passphrase);

    if (secondPassphrase) {
        builder.secondSign(secondPassphrase);
    }

    return builder.getStruct();
}

export function createSecondPassphraseTransaction(
    fees: number,
    nonce: string,
    passphrase: string,
    secondPassphrase: string,
): Interfaces.ITransactionData {
    return Transactions.BuilderFactory.secondSignature()
        .fee(`${fees}`)
        .nonce(nonce)
        .signatureAsset(secondPassphrase)
        .sign(passphrase)
        .getStruct();
}

export function createDelegateRegisterTransaction(
    unikId: string,
    fees: number,
    nonce: string,
    passphrase: string,
    secondPassphrase: string,
): Interfaces.ITransactionData {
    Transactions.TransactionRegistry.registerTransactionType(DelegateRegisterTransaction);
    const builder = new UNSDelegateRegisterBuilder()
        .fee(`${fees}`)
        .nonce(nonce)
        .usernameAsset(unikId)
        .sign(passphrase);

    if (secondPassphrase) {
        builder.secondSign(secondPassphrase);
    }
    return builder.getStruct();
}

export function createDelegateResignTransaction(
    fees: number,
    nonce: string,
    passphrase: string,
    secondPassphrase: string,
): Interfaces.ITransactionData {
    Transactions.TransactionRegistry.registerTransactionType(DelegateResignTransaction);
    const builder = new UNSDelegateResignBuilder()
        .fee(`${fees}`)
        .nonce(nonce)
        .sign(passphrase);

    if (secondPassphrase) {
        builder.secondSign(secondPassphrase);
    }
    return builder.getStruct();
}

export function createVoteTransaction(
    delegateVotes: string[],
    fees: number,
    nonce: string,
    passphrase: string,
    secondPassphrase: string,
): Interfaces.ITransactionData {
    Transactions.TransactionRegistry.registerTransactionType(VoteTransaction);
    const builder = new UNSVoteBuilder()
        .fee(`${fees}`)
        .nonce(nonce)
        .votesAsset(delegateVotes)
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
    return promptHidden("Enter your crypto account passphrase (12 words phrase)");
};

export const getSecondPassphraseFromUser = (): Promise<string> => {
    return promptHidden(
        "You have associated a second passphrase to your crypto account. This second passphrase is needed to validate this transaction.\nPlease, enter it (12 words phrase)",
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
    const fullUrl = new urlModule.URL(urlString);
    return fullUrl.origin;
}

type OneOfAllNetworks = "devnet" | "dalinet" | "mainnet" | "unitnet" | "testnet" | "sandbox" | "livenet";

export function getNetworkNameByNetHash(nethash: string): string {
    const selectedNetworks: string[] = Object.keys(Networks).filter((network: string) => {
        const netw: OneOfAllNetworks = network as OneOfAllNetworks;
        return Networks[netw].network.nethash === nethash;
    });

    if (selectedNetworks.length < 1) {
        throw new Error(`No network found with nethash '${nethash}'`);
    }

    return selectedNetworks[0];
}

export function getDelegateIdArgumentDescription(specificDescriptionPart: string): string {
    return `unikid or the @unikname with DID format to ${specificDescriptionPart}. (${getDidDocsUrl()})`;
}

function getDidDocsUrl(): string {
    return `${getDocsUrl()}/uns-use-the-network/cheatsheet.html#did-decentralized-identifier`;
}

function getDocsUrl() {
    return "https://docs.uns.network";
}

export function getTargetArg() {
    return {
        name: "target",
        description: `Target unikid or @unikname (see ${getDidDocsUrl()})`,
        required: true,
    };
}
export function getDelegateArg(descStr: string) {
    return {
        name: "target",
        description: getDelegateIdArgumentDescription(descStr),
        required: true,
    };
}
