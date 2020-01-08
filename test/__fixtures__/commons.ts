import Config from "@oclif/config";
import { expect, test } from "@oclif/test";
import { Network, UNSClient } from "@uns/ts-sdk";

export const UNS_CLIENT_FOR_TESTS = new UNSClient();
UNS_CLIENT_FOR_TESTS.init({ network: Network.default });

export const applyExitCase = (exitCase: any) => {
    let tester = test;

    if (exitCase.errorMsg) {
        tester = tester.stderr();
    }

    if (exitCase?.mocks?.nodeConfigurationCrypto) {
        tester = tester.nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api.get(`/node/configuration/crypto`).reply(200, NODE_CONFIGURATION_CRYPTO),
        );
    }

    if (exitCase?.mocks?.blockchain) {
        tester = tester.nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api.get(`/blockchain`).reply(200, BLOCKCHAIN),
        );
    }

    if (exitCase?.mocks?.custom) {
        for (const customMock of exitCase?.mocks?.custom) {
            tester = tester.nock(customMock.url, customMock.cb);
        }
    }

    tester = tester.command(exitCase.args);
    if (exitCase.errorMsg) {
        tester
            // tslint:disable-next-line:no-empty
            .catch(_ => {})
            .it(exitCase.description, (ctx: any) => {
                expect(ctx.stderr).to.equal(exitCase.errorMsg);
            });
    } else {
        // tslint:disable-next-line:no-empty
        tester.exit(exitCase.exitCode).it(exitCase.description, _ => {});
    }
};

export const getMeta = (blockHeight: number) => {
    return {
        height: `${blockHeight}`,
        timestamp: {
            epoch: 79391124,
            unix: 1569488724,
            human: "2019-09-26T09:05:24.000Z",
        },
    };
};

export const EMPTY_COMMAND_CONFIG: Config.IConfig = {} as Config.IConfig;

export const NODE_CONFIGURATION = {
    data: {
        core: { version: "2.6.0-next.4" },
        nethash: "6abbd2129d685b125f940c853d9b7d1f83cbf62444f4e7a497424ed9cfbda7c8",
        slip44: 1,
        wif: 218,
        token: "DUNS",
        symbol: "DUNS",
        explorer: "https://dalinet.explorer.uns.network",
        version: 30,
        ports: { "@arkecosystem/core-p2p": null, "@arkecosystem/core-api": 4003 },
        constants: {
            height: 2,
            reward: 200000000,
            activeDelegates: 3,
            blocktime: 8,
            block: {
                version: 0,
                maxTransactions: 500,
                maxPayload: 21000000,
                acceptExpiredTransactionTimestamps: false,
                idFullSha256: true,
            },
            epoch: "2019-09-19T11:42:10.474Z",
            fees: {
                staticFees: {
                    transfer: 10000000,
                    secondSignature: 500000000,
                    delegateRegistration: 2500000000,
                    vote: 100000000,
                    multiSignature: 500000000,
                    ipfs: 500000000,
                    multiPayment: 10000000,
                    delegateResignation: 2500000000,
                    htlcLock: 10000000,
                    htlcClaim: 0,
                    htlcRefund: 0,
                },
            },
            ignoreInvalidSecondSignatureField: false,
            vendorFieldLength: 255,
            ignoreExpiredTransactions: false,
            multiPaymentLimit: 128,
            aip11: true,
        },
        transactionPool: {
            dynamicFees: {
                enabled: true,
                minFeePool: 1000,
                minFeeBroadcast: 1000,
                addonBytes: {
                    transfer: 100,
                    secondSignature: 250,
                    delegateRegistration: 400000,
                    vote: 100,
                    multiSignature: 500,
                    ipfs: 250,
                    multiPayment: 500,
                    delegateResignation: 100,
                    htlcLock: 100,
                    htlcClaim: 0,
                    htlcRefund: 0,
                },
            },
        },
    },
};

export const NODE_CONFIGURATION_CRYPTO = {
    data: {
        exceptions: { blocks: [], transactions: [] },
        genesisBlock: {
            version: 0,
            totalAmount: "10000000000000000",
            totalFee: "0",
            reward: "0",
            payloadHash: "6abbd2129d685b125f940c853d9b7d1f83cbf62444f4e7a497424ed9cfbda7c8",
            timestamp: 0,
            numberOfTransactions: 4,
            payloadLength: 865,
            previousBlock: null,
            generatorPublicKey: "03d11c3889fbfbd0e991ce88d1af630afd501401c4e8e464a4400fc2b6cf1789f1",
            transactions: [
                {
                    timestamp: 0,
                    version: 1,
                    type: 0,
                    fee: "0",
                    amount: "10000000000000000",
                    recipientId: "DA3BSpo52UqTnKVjZ4MhEVV2zzZT8WhVHf",
                    senderPublicKey: "03cd31b8f8018e2e047e572eddbf63c35978de91b8f406f53437254f335be02c12",
                    expiration: 0,
                    signature:
                        "3045022100f5636bca6da272ec0b5f2e42fd8d0c156fc7570fe73fcfce789c5adb1561d137022028b087aad4391a52afb1471e471e3caa01e219ba4f689d0b6c4b932bbd0a8dd3",
                    senderId: "DQJ5epn2TEHQ1N5vY9sbnYmr5M7qBbtq7V",
                    id: "21334d5e854351e46b9d30f79196671e3e9a993e2e8316172a155b93bf8aac51",
                    typeGroup: 1,
                },
                {
                    timestamp: 0,
                    version: 1,
                    type: 2,
                    fee: "0",
                    amount: "0",
                    recipientId: null,
                    senderPublicKey: "0385bd205aed4b95bd57ef9e0437788ff9505a6f15e37ca222d15fedc2720d503a",
                    asset: {
                        delegate: {
                            username: "genesis_1",
                            publicKey: "0385bd205aed4b95bd57ef9e0437788ff9505a6f15e37ca222d15fedc2720d503a",
                        },
                    },
                    signature:
                        "304402203a6076f7d281a6bc02116b5e29b77123d16c0a960551c171c154b4fa45da09ef022056b8c8f3a797937cbd25fa4f9a4c1e0717e309d265866699ea6184536899aca5",
                    senderId: "D6gDk2j9xn71GCWSt4h6qJ383cDJdB5LqH",
                    id: "aad5667771418b9f6a342ab1e0f7c4995b4c112b4de44eb5dbbefe568e7570e1",
                    typeGroup: 1,
                },
                {
                    timestamp: 0,
                    version: 1,
                    type: 2,
                    fee: "0",
                    amount: "0",
                    recipientId: null,
                    senderPublicKey: "031681b82f828ea0a16418966f8651aae1459c8f3edb6c5b7530958f94d142960d",
                    asset: {
                        delegate: {
                            username: "genesis_2",
                            publicKey: "031681b82f828ea0a16418966f8651aae1459c8f3edb6c5b7530958f94d142960d",
                        },
                    },
                    signature:
                        "3045022100cae8a05a0bb82c23f8d767e45bc0f3736ad336001a2683987a5eb067be181e0a02204a54f59b94afe91e6caebf6a7a98a93db4296a71e5f427e6a1b15dd26a265fc7",
                    senderId: "DMMWirytcnRpHpkwt7hE3qyATdVu7NZTPP",
                    id: "3c24e1cc56387e3fff375d33fc08fd57805f6d8bc37ae511eee1e2fdd48d1d53",
                    typeGroup: 1,
                },
                {
                    timestamp: 0,
                    version: 1,
                    type: 2,
                    fee: "0",
                    amount: "0",
                    recipientId: null,
                    senderPublicKey: "0283c5017e5d19847d2362623559274974ceb5f40cdaafe38c0e7ac5348825056c",
                    asset: {
                        delegate: {
                            username: "genesis_3",
                            publicKey: "0283c5017e5d19847d2362623559274974ceb5f40cdaafe38c0e7ac5348825056c",
                        },
                    },
                    signature:
                        "3044022062e0edd1549977c8064bba35935873cf2e6331354d751fef4ffe33fdc455b92602206940ac7dc1f7f972a67bda34f6176c680aa7ce7ce840fdb597291c3998d6f965",
                    senderId: "DMBbnpPRge4NprMxNDyLkBa1bRq7QjvqRc",
                    id: "bca7b17ca3252b31fbcc8d8053021a418fffd5acf800f7a0226e7b3acebc824f",
                    typeGroup: 1,
                },
            ],
            height: 1,
            id: "7549055109973403950",
            blockSignature:
                "3045022100996bfb6b4f032a57552d4c9e57e93e0eff71769c6ff9d1e1daa06db16babeac202204e1dad2872fa22ee428bbd2b77d4716dae12f3e8c1a0ad1f26fafbc6bc0597fc",
        },
        milestones: [
            {
                height: 1,
                reward: 200000000,
                activeDelegates: 3,
                blocktime: 8,
                block: {
                    version: 0,
                    maxTransactions: 500,
                    maxPayload: 21000000,
                    acceptExpiredTransactionTimestamps: false,
                    idFullSha256: false,
                },
                epoch: "2019-09-19T11:42:10.474Z",
                fees: {
                    staticFees: {
                        transfer: 10000000,
                        secondSignature: 500000000,
                        delegateRegistration: 2500000000,
                        vote: 100000000,
                        multiSignature: 500000000,
                        ipfs: 500000000,
                        multiPayment: 10000000,
                        delegateResignation: 2500000000,
                        htlcLock: 10000000,
                        htlcClaim: 0,
                        htlcRefund: 0,
                    },
                },
                ignoreInvalidSecondSignatureField: false,
                vendorFieldLength: 255,
                ignoreExpiredTransactions: false,
                multiPaymentLimit: 128,
            },
            {
                height: 2,
                reward: 200000000,
                activeDelegates: 3,
                blocktime: 8,
                block: {
                    version: 0,
                    maxTransactions: 500,
                    maxPayload: 21000000,
                    acceptExpiredTransactionTimestamps: false,
                    idFullSha256: true,
                },
                epoch: "2019-09-19T11:42:10.474Z",
                fees: {
                    staticFees: {
                        transfer: 10000000,
                        secondSignature: 500000000,
                        delegateRegistration: 2500000000,
                        vote: 100000000,
                        multiSignature: 500000000,
                        ipfs: 500000000,
                        multiPayment: 10000000,
                        delegateResignation: 2500000000,
                        htlcLock: 10000000,
                        htlcClaim: 0,
                        htlcRefund: 0,
                    },
                },
                ignoreInvalidSecondSignatureField: false,
                vendorFieldLength: 255,
                ignoreExpiredTransactions: false,
                multiPaymentLimit: 128,
                aip11: true,
            },
        ],
        network: {
            name: "dalinet",
            messagePrefix: "DALI message:\n",
            bip32: { public: 46090600, private: 46089520 },
            pubKeyHash: 30,
            nethash: "6abbd2129d685b125f940c853d9b7d1f83cbf62444f4e7a497424ed9cfbda7c8",
            wif: 218,
            slip44: 1,
            aip20: 1,
            client: { token: "DUNS", symbol: "DUNS", explorer: "https://dalinet.explorer.uns.network" },
        },
    },
};

export const NODE_STATUS = {
    data: {
        synced: true,
        now: 693652,
        blocksCount: -1,
    },
};

export const BLOCKCHAIN = {
    data: {
        block: {
            height: 185498,
            id: "b62b615936129743a0e0946027d5ff20dd7ba0ac575c7cf87b5b2723e443b86f",
        },
        supply: "10037099600000000",
    },
};
