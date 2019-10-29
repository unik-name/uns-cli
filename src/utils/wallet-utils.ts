export function isPassphrase(passphrase: string) {
    return passphrase && passphrase.split(" ").length === 12;
}

export const checkPassphraseFormat = (passphrase: string) => {
    if (!isPassphrase(passphrase)) {
        throw new Error("Wrong pass phrase format");
    }
};
