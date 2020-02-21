import { DidResolution, didResolve, UNS_NFT_PROPERTY_KEY_REGEX } from "@uns/ts-sdk";

export function isTokenId(tokenId: string) {
    return tokenId && tokenId.length === 64 && tokenId.match(/^[0-9a-f]+$/);
}

export function isDid(didStr: string) {
    return didStr && didStr.startsWith("@");
}

export const checkUnikIdFormat = (unikid: string) => {
    if (!isTokenId(unikid)) {
        throw new Error("Unikid parameter does not match expected format");
    }
};

export const checkUnikPropertyFormat = (propertyKey: string, toWrite: boolean = true) => {
    const valid = propertyKey && propertyKey.match(UNS_NFT_PROPERTY_KEY_REGEX)?.[0] === propertyKey;
    if (!valid) {
        throw new Error(`Property key ${propertyKey} should match ${UNS_NFT_PROPERTY_KEY_REGEX} pattern`);
    }

    if (toWrite && !propertyKey.startsWith("usr/")) {
        throw new Error('Property key must start with "usr/."');
    }
};

export async function resolveUnikName(unikName: string, flags: { [x: string]: any }): Promise<DidResolution<any>> {
    const didResolveNetwork = flags.network === "local" ? "testnet" : flags.network;
    try {
        return await didResolve(unikName, didResolveNetwork);
    } catch (error) {
        let resolveError;
        if (error.response?.status === 404) {
            resolveError = { message: "DID does not exist" };
        } else {
            resolveError = error; // errorMsg = `An error occurred. Please see details below:\n ${error.message}`;
        }
        return { error: resolveError };
    }
}
