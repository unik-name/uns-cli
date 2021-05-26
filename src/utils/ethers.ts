import { Network } from "@uns/ts-sdk";
import { ChainId, Token, WETH, Fetcher, Route, Price } from "@uniswap/sdk";
import { Utils } from "@uns/ark-crypto";
import { ethers, getDefaultProvider } from "ethers";

const provider = (flags: Record<string, any>) =>
    getDefaultProvider(flags.network === Network.sandbox ? "ropsten" : "homestead");

const getContractAddress = (flags: Record<string, any>) => {
    switch (flags.network) {
        case "livenet":
            throw new Error("Livenet swap is not supported yet");
        case "sandbox":
            if (flags.dev) {
                return "0x14ed92dEaa299dfB63aE320652cAE8404D769Aa5";
            } else {
                return "0xddb887226cf32b7c7be62ebcad145f212869007b";
            }
        // @ts-ignore
        case "dalinet":
            if (process.env.NODE_ENV === "test") return "Sc68Hu6hRTCy9z4b7ppoeD24AX227fZ5UX";
        default:
            throw new Error("Unsupported swap network");
    }
};

const decimals18To8 = (amount18: string): string => {
    const amount8 = amount18.substr(0, amount18.length - 10);
    return amount8.length ? amount8 : "0";
};

export const eth2Uns = async (flags: Record<string, any>, amount18: string): Promise<Utils.BigNumber> => {
    const ethPriceUns = await getUNSETHPrice(flags, true);
    return Utils.BigNumber.make(decimals18To8(ethPriceUns.raw.multiply(amount18).toFixed(0)));
};

export const getErcMintCost = async (flags: Record<string, any>): Promise<ethers.BigNumber> => {
    // gas estimation for ercmint on ropsten
    const gas = ethers.BigNumber.from("68714");
    const gasPrice = await provider(flags).getGasPrice();
    return gas.mul(gasPrice);
};

/**
 * Fetch the wUNS/ETH pair mid price from Uniswap
 * @see https://uniswap.org/docs/v2/javascript-SDK/pricing/
 */
const getUNSETHPrice = async (flags: Record<string, any>, invert: boolean = false): Promise<Price> => {
    const chainId = getChainId(flags);
    const token = new Token(chainId, getContractAddress(flags), 18);

    const pair = await Fetcher.fetchPairData(token, WETH[chainId]);

    const route = new Route([pair], WETH[chainId]);

    let price = route.midPrice;
    if (!invert) {
        price = price.invert();
    }
    return price;
};

const getChainId = (flags: Record<string, any>): ChainId =>
    flags.network === Network.sandbox ? ChainId.ROPSTEN : ChainId.MAINNET;

export const getErcSymbol = (flags: Record<string, any>): string => (flags.dev ? "PIZ" : "wUNS");
