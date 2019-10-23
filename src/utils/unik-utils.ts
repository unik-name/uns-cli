export const checkUnikIdFormat = (unikid: string) => {
    const valid = unikid && unikid.length === 64;
    if (!valid) {
        throw new Error("Unikid parameter does not match expected format");
    }
};
