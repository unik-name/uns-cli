export const commandName: string = "disclose-explicit-values";

const unikId = "ad165bad9ae65009b0379e9f839d0c91e05f59f613f9ea2ef5f2b1ef2bbe81a1";

export const transaction = {
    id: "5c99940dad57352fabf9129bc24754780147c369a54b0128b866abd206a5f238",
    confirmations: 1413,
};

export const shouldExit = [
    {
        description: "Should exit with code 2 if network flag is not passed",
        args: ["disclose-explicit-values"],
        exitCode: 2,
    },
    {
        description: "Should exit with code 2 if network is not known",
        args: [commandName, "--network", "customNetwork"],
        exitCode: 2,
    },
    {
        description: "Should exit with code 2 if network is not known",
        args: [commandName, "--network", "customNetwork"],
        exitCode: 2,
    },
    {
        description: "Should exit with code 2 if no explicit value passed",
        args: [commandName, "--network", "devnet", "--unikid", unikId],
        exitCode: 2,
    },
    {
        description: "Should exit with code 2 if no unikid value passed",
        args: [commandName, "--network", "devnet", "-e", "unikname"],
        exitCode: 2,
    },
];
