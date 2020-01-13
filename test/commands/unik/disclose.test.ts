import { expect as oclifExpect, test } from "@oclif/test";
import { cli } from "cli-ux";
import { UnikDiscloseCommand } from "../../../src/commands/unik/disclose";
import {
    CHAINMETA,
    DISCLOSE_DEMAND,
    DISCLOSE_DEMAND_CERTIFICATION,
    DISCLOSE_OUTPUT,
    DISCLOSE_TRANSACTION,
    DISCLOSE_TRANSACTION_ID,
    shouldExit,
    transaction,
    TRANSACTION_ID,
    UNIK,
    UNIK_ID,
    WALLET,
    WALLET_PASSPHRASE,
    WALLET_PUB_KEY,
} from "../../__fixtures__/commands/unik/disclose";
import { applyExitCase, EMPTY_COMMAND_CONFIG, NODE_CONFIGURATION_CRYPTO } from "../../__fixtures__/commons";
import { UNS_CLIENT_FOR_TESTS } from "../../__fixtures__/commons";

import { Transactions } from "@uns/ark-crypto";
import * as SDK from "@uns/ts-sdk";

const commandName: string = "unik:disclose";

describe(`${commandName} command`, () => {
    beforeEach(() => {
        process.env.DEV_MODE = "true";
    });

    describe("Exit cases", () => {
        shouldExit.forEach(exitCase => applyExitCase(exitCase));
    });

    describe("Success", () => {
        jest.setTimeout(10000);
        jest.spyOn(SDK, "buildDiscloseDemand").mockImplementation(() => DISCLOSE_DEMAND);
        jest.spyOn(Transactions.Utils, "getId").mockImplementation(() => DISCLOSE_TRANSACTION_ID);

        test.nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.service.url, api =>
            api
                .post("/unik-name-fingerprint", {
                    explicitValue: "captain-obvious",
                    type: "individual",
                    nftName: "UNIK",
                })
                .reply(200, {
                    data: {
                        fingerprint: UNIK_ID,
                    },
                }),
        )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.service.url, api =>
                api
                    .post("/unik-name-fingerprint", {
                        explicitValue: "captain0bvious",
                        type: "individual",
                        nftName: "UNIK",
                    })
                    .reply(200, {
                        data: {
                            fingerprint: UNIK_ID,
                        },
                    }),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.service.url, api => {
                api.post("/disclose-demand-certification", DISCLOSE_DEMAND, {
                    reqheaders: { "uns-network": "dalinet" },
                }).reply(200, { data: DISCLOSE_DEMAND_CERTIFICATION });
            })

            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api
                    .post("/transactions", {
                        transactions: [DISCLOSE_TRANSACTION],
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
                api.get(`/transactions/${TRANSACTION_ID}`).reply(200, {
                    data: {
                        id: TRANSACTION_ID,
                        confirmations: 20,
                    },
                    chainmeta: CHAINMETA,
                }),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/transactions/${DISCLOSE_TRANSACTION_ID}`).reply(200, {
                    data: {
                        id: DISCLOSE_TRANSACTION_ID,
                        confirmations: 20,
                    },
                    chainmeta: CHAINMETA,
                }),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/wallets/${WALLET_PUB_KEY}`).reply(200, {
                    data: WALLET,
                    chainmeta: CHAINMETA,
                }),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api => {
                api.get(`/uniks/${UNIK_ID}`)
                    .twice()
                    .reply(200, { data: UNIK, chainmeta: CHAINMETA });
            })
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api => {
                api.get(`/uniks/${UNIK_ID}/properties/type`).reply(200, { data: "1", chainmeta: CHAINMETA });
            })
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
            .stub(cli, "confirm", () => async () => "y")
            .stdout()
            .command([
                commandName,
                "--passphrase",
                WALLET_PASSPHRASE,
                "-n",
                "dalinet",
                "--explicitValue",
                "captain-obvious",
                "--explicitValue",
                "captain0bvious",
                "--unikid",
                UNIK_ID,
            ])
            .it("Should disclose captain-obvious without error", ctx => {
                oclifExpect(ctx.stdout).to.equal(DISCLOSE_OUTPUT);
            });
    });

    describe("Unit tests", () => {
        let command: UnikDiscloseCommand;

        beforeEach(() => {
            command = new UnikDiscloseCommand([], EMPTY_COMMAND_CONFIG);
        });

        describe("formatResult", () => {
            it("should match with existing transaction", async () => {
                const infoFunction = jest.spyOn(command, "info");
                const errorFunction = jest.spyOn(command, "error");
                const result = await command.formatResult(transaction, transaction.id);

                expect(infoFunction.mock.calls.length).toEqual(1);
                expect(errorFunction.mock.calls.length).toEqual(0);

                expect(result).toEqual({
                    data: {
                        transaction: transaction.id,
                        confirmations: transaction.confirmations,
                    },
                });
            });

            it("should match with existing transaction", async () => {
                const infoFunction = jest.spyOn(command, "info");
                const errorFunction = jest.spyOn(command, "error");

                jest.spyOn(command, "getTransactionUrl").mockImplementation(_ => "URL");

                try {
                    await command.formatResult(undefined, transaction.id);
                    expect(true).toBeFalsy();
                } catch (e) {
                    expect(e.message).toEqual(
                        "Transaction not found yet, the network can be slow. Check this url in a while: URL",
                    );
                }

                expect(infoFunction.mock.calls.length).toEqual(0);
                expect(errorFunction.mock.calls.length).toEqual(1);
            });
        });
    });
});
