export const checkPassphraseFormat = (passphrase: string) => {
    const valid = passphrase && passphrase.split(" ").length === 12;
    if (!valid) {
        throw new Error("Wrong pass phrase format");
    }
};
