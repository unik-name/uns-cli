import { Network, UNSClient, Wallet } from "@uns/ts-sdk";

export const commandName = "delegate:vote";

export const UNS_CLIENT_FOR_TESTS = new UNSClient();
UNS_CLIENT_FOR_TESTS.init({ network: Network.default });

export const wallet: Wallet = {
    address: "D59pZ7fH6vtk23mADnbpqyhfMiJzpdixws",
    publicKey: "020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011",
    balance: 999974660000000,
    isDelegate: false,
};

export const meta = {
    height: "33",
    timestamp: {
        epoch: 79391124,
        unix: 1569488724,
        human: "2019-09-26T09:05:24.000Z",
    },
};

const UNIK_ID_NOT_FOUND = "8f9b5d3e071edc730003be0aaaaaaaaaaf7245ab240e809cc34f974156303b1f";

export const shouldExit = [
    {
        description: "Should exit with code 2 no delegate id",
        args: [commandName, "-n", "dalinet"],
        errorMsg:
            "» :stop: Command fail because of unexpected value for at least one parameter (target). Please check your parameters.;\n",
    },
    {
        description: "Should exit with code 1 if delegate id malformed (no @)",
        args: [commandName, "-n", "dalinet", "delegateId"],
        errorMsg: "» :stop: Unik target argument does not match expected format.;\n",
        mocks: {
            nodeConfigurationCrypto: true,
            blockchain: true,
        },
    },
    {
        description: "Should exit with code 1 if delegate not found with token id",
        args: [commandName, "-n", "dalinet", UNIK_ID_NOT_FOUND],
        errorMsg: `» :stop: No UNIK found with id ${UNIK_ID_NOT_FOUND}.;\n`,
        mocks: {
            nodeConfigurationCrypto: true,
            blockchain: true,
            custom: [
                {
                    url: UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url,
                    cb: (api: any) => api.get(`/uniks/${UNIK_ID_NOT_FOUND}`).reply(404),
                },
            ],
        },
    },
    {
        description: "Should exit with code 1 if delegate found but not registered",
        args: [commandName, "-n", "dalinet", "@delegateId"],
        errorMsg: "» :stop: This Unikname is not registered as delegate.;\n",
        mocks: {
            blockchain: true,
            nodeConfigurationCrypto: true,
            custom: [
                {
                    url: UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url,
                    cb: (api: any) =>
                        api.get(`/wallets/${wallet.address}`).reply(200, {
                            data: wallet,
                            chainmeta: meta,
                        }),
                },
            ],
        },
    },
];
