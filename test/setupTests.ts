import { Utils } from "@uns/ark-crypto";
import { NftMintDemandCertificationSigner } from "@uns/crypto";

beforeEach(() => {
    // Reset all environment variables, which might be configured on this computer
    process.env.UNS_NETWORK = undefined;
    process.env.DEV_MODE = undefined;
});

afterEach(() => {
    // Launching all tests throws `MaxListenersExceededWarning: Possible EventEmitter memory leak detected` warning. In some tests we test stdout content, we can't have warnings
    process.stdout.removeAllListeners();
    process.stderr.removeAllListeners();
});

beforeAll(async () => {
    // Handle ECDSA curve init ()
    try {
        await new NftMintDemandCertificationSigner({ iss: "", sub: "", iat: 123, cost: Utils.BigNumber.ZERO }).sign(
            "path adult harsh access case slice source error protect brave reason okay",
        );
    } catch (_) {
        /* Nothing to do */
    }
});
