import { generateMnemonic } from "bip39";
import { createHash, randomBytes } from "crypto";
import * as MoreEntropy from "promised-entropy";

export function isPassphrase(passphrase: string) {
    return passphrase && passphrase.split(" ").length === 12;
}

export const checkPassphraseFormat = (passphrase: string) => {
    if (!isPassphrase(passphrase)) {
        throw new Error("Wrong pass phrase format");
    }
};

export async function generatePassphrase() {
    const nbBits: number = 128;
    const bytes = Math.ceil(nbBits / 8);
    const hudgeEntropy: number[] = await MoreEntropy.promisedEntropy(nbBits);
    const seed = randomBytes(bytes);
    const entropy = createHash("sha256")
        .update(Buffer.from(new Int32Array(hudgeEntropy).buffer))
        .update(seed)
        .digest()
        .slice(0, bytes);
    return generateMnemonic(nbBits, _ => entropy);
}
