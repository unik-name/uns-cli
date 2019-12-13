export const commandName: string = "unik:disclose";

const unikId = "ad165bad9ae65009b0379e9f839d0c91e05f59f613f9ea2ef5f2b1ef2bbe81a1";

export const transaction = {
    id: "5c99940dad57352fabf9129bc24754780147c369a54b0128b866abd206a5f238",
    confirmations: 1413,
};

export const shouldExit = [
    {
        description: "Should exit with code 2 if no explicit value passed",
        args: [commandName, "--network", "sandbox", "--unikid", unikId],
        exitCode: 2,
    },
    {
        description: "Should exit with code 2 if no unikid value passed",
        args: [commandName, "--network", "sandbox", "-e", "unikname"],
        exitCode: 2,
    },
];
