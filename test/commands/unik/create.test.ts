import { expect, test } from "@oclif/test";
import { Crypto, Transactions } from "@uns/ark-crypto";
import { Transactions as NftTransactions } from "@uns/core-nft-crypto";
import {
    meta,
    outputCases,
    shouldExit,
    transaction,
    TRANSACTION_ID,
    TRANSACTION_TIMESTAMP,
    UNIK_ID,
    WALLET,
    WALLET_CHAINMETA,
    WALLET_ID,
} from "../../__fixtures__/commands/unik/create";
import { applyExitCase, NODE_CONFIGURATION_CRYPTO, UNS_CLIENT_FOR_TESTS } from "../../__fixtures__/commons";

const applyTestCase = (testCase: any) => {
    test.nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.service.url, api =>
        api.post("/unik-name-fingerprint", { explicitValue: "bob", type: "individual", nftName: "UNIK" }).reply(200, {
            data: {
                fingerprint: UNIK_ID,
            },
        }),
    )
        .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api
                .post("/transactions", {
                    transactions: [transaction],
                })
                .reply(200, {
                    data: {
                        accept: [],
                        broadcast: [],
                        invalid: [],
                        excess: [],
                    },
                }),
        )
        .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api.get("/wallets/020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011").reply(200, {
                data: WALLET,
                ...WALLET_CHAINMETA,
            }),
        )
        .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api.get(`/transactions/${TRANSACTION_ID}`).reply(200, {
                data: {
                    id: TRANSACTION_ID,
                    confirmations: 20,
                },
                chainmeta: meta,
            }),
        )
        .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api.get(`/wallets/${WALLET_ID}`).reply(200, {
                data: WALLET,
                ...WALLET_CHAINMETA,
            }),
        )
        .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api.get(`/node/configuration/crypto`).reply(200, NODE_CONFIGURATION_CRYPTO),
        )
        .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api.get("/blockchain").reply(200, {
                data: {
                    supply: 2119999400000000,
                    block: {
                        height: 10,
                    },
                },
            }),
        )
        .stdout()
        .command(testCase.args)
        .it(testCase.description, ctx => {
            expect(ctx.stdout).to.equal(testCase.expected);
        });
};

describe("create-unik command", () => {
    beforeEach(() => {
        process.env.DEV_MODE = "true";
    });

    describe("Exit cases", () => {
        shouldExit.forEach(exitCase => applyExitCase(exitCase));
    });

    describe("Run cases", () => {
        // Mock function that create transaction timestamp
        jest.spyOn(Crypto.Slots, "getTime").mockImplementation(() => TRANSACTION_TIMESTAMP);

        // Mock function that create transaction id
        jest.spyOn(Transactions.Utils, "getId").mockImplementation(() => TRANSACTION_ID);

        jest.setTimeout(10000);
        afterEach(() => {
            Transactions.TransactionRegistry.deregisterTransactionType(NftTransactions.NftMintTransaction);
        });
        outputCases.forEach(testCase => applyTestCase(testCase));
    });
});
