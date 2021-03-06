import { Identities } from "@uns/ark-crypto";
import { didResolve, UNSClient } from "@uns/ts-sdk";
import { generateMnemonic } from "bip39";
import { createHash, randomBytes } from "crypto";
import * as MoreEntropy from "promised-entropy";
import { UnsClientWrapper } from "sdkWrapper";

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
    return generateMnemonic(nbBits, (_) => entropy);
}

export async function getUniknameWalletAddress(id: string, unsClient: UNSClient) {
    const DID_DEFAULT_QUERY = "?*";
    const resolveResult = await didResolve(
        `${id}${id.endsWith(DID_DEFAULT_QUERY) ? "" : DID_DEFAULT_QUERY}`,
        unsClient,
    );
    if (resolveResult.error) {
        throw resolveResult.error;
    }
    return resolveResult.data as string;
}

export async function getWalletAddress(id: string, unsClientWrapper: UnsClientWrapper): Promise<string> {
    if (!Identities.Address.validate(id, unsClientWrapper.getVersion())) {
        try {
            return Identities.Address.fromPublicKey(id);
        } catch (_) {
            throw new Error(`Crypto account identifier does not match expected format`);
        }
    } else {
        return id;
    }
}
