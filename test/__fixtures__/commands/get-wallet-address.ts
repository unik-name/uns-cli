import { NETWORKS } from "../../../src/config";

const commandName = "get-wallet-address";

export const NOT_FOUND_UNIK_ID = "e1615becbd39ad96344919dffa7b972f293b0a3973b05145fd6d0a1a20cac169";
export const WALLET_ADDRESS = "DTRnY3JjFpAmCX1nFtF8M4v8X7WdvPYRxa";
export const WALLET_PUBKEY = "03898f61b18cbddb6a8698897b66f519a44c8473beef289c4ddbfd4169db71a842";
export const WALLET_CHAINMETA = {
    height: 415890,
    timestamp: {
        epoch: 3453333,
        unix: 1572346663,
        human: "2019-10-29T10:57:43.000Z",
    },
};

export const OUTPUT_CHAINMETA = {
    network: "devnet",
    node: NETWORKS.devnet.url,
    date: WALLET_CHAINMETA.timestamp.human,
    height: WALLET_CHAINMETA.height,
};

export const shouldExit = [
    {
        description: "Should exit with code 2 if output format is not allowed for that command",
        args: [commandName, "-n", "devnet", "-f", "table"],
        exitCode: 2,
    },
    {
        description: "Should exit with code 1 if UNIK from unikid is not found",
        args: [commandName, "-n", "devnet", NOT_FOUND_UNIK_ID],
        exitCode: 1,
    },
    {
        description: "Should exit with code 1 if ID argument doesn't correspond to valid passphrase",
        args: [commandName, "-n", "devnet", "abc"],
        exitCode: 1,
    },
];
