export function isTokenId(tokenId: string) {
    return tokenId && tokenId.length === 64;
}
export const checkUnikIdFormat = (unikid: string) => {
    if (!isTokenId(unikid)) {
        throw new Error("Unikid parameter does not match expected format");
    }
};

export const checkUnikPropertyFormat = (propertyKey: string) => {
    const valid = propertyKey && propertyKey.match(/[a-zA-Z0-9]+/)?.[0] === propertyKey;
    if (!valid) {
        throw new Error(`Property ${propertyKey} does not match expected format`);
    }
};
