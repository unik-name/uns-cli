import { UNS_NFT_PROPERTY_KEY_REGEX } from "@uns/ts-sdk";

export function isTokenId(tokenId: string) {
    return tokenId && tokenId.length === 64 && tokenId.match(/^[0-9a-f]+$/);
}
export const checkUnikIdFormat = (unikid: string) => {
    if (!isTokenId(unikid)) {
        throw new Error("Unikid parameter does not match expected format");
    }
};

export const checkUnikPropertyFormat = (propertyKey: string) => {
    const valid = propertyKey && propertyKey.match(UNS_NFT_PROPERTY_KEY_REGEX)?.[0] === propertyKey;
    if (!valid) {
        throw new Error(`Property key ${propertyKey} should match ${UNS_NFT_PROPERTY_KEY_REGEX} pattern`);
    }
};
