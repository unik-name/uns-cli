export const commandName: string = "unik:send"; // Known command to pass common command tests

export const shouldExit = [
    { description: "Should exit with code 2 if network flag is not passed", args: [commandName], exitCode: 2 },
    {
        description: "Should exit with code 2 if network is not known",
        args: [commandName, "--network", "customNetwork"],
        exitCode: 2,
    },
];
