import { UNS_CLIENT_FOR_TESTS } from "./vote";

export const commandName = "delegate:register";
export const UNIK_ID = "8f9b5d3e071edc730003be0aaaaaaaaaaf7245ab240e809cc34f974156303b1f";

export const shouldExit = [
    {
        description: "Should exit with code 2 no delegate id",
        args: [commandName, "-n", "dalinet"],
        errorMsg:
            "» :stop: Command fail because of unexpected value for at least one parameter (target). Please check your parameters.;\n",
    },
    {
        description: "Should exit with code 1 if delegate not found with token id",
        args: [commandName, "-n", "dalinet", UNIK_ID],
        errorMsg: `» :stop: No UNIK found with id ${UNIK_ID}.;\n`,
        mocks: {
            nodeConfigurationCrypto: true,
            blockchain: true,
            custom: [
                {
                    url: UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.network,
                    cb: (api: any) => api.get(`/uniks/${UNIK_ID}`).reply(404),
                },
            ],
        },
    },
];
