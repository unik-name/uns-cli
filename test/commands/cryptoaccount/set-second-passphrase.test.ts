import { expect, test } from "@oclif/test";
import cli from "cli-ux";
import { NODE_CONFIGURATION_CRYPTO, UNS_CLIENT_FOR_TESTS } from "../../__fixtures__/commons";

const commandName: string = "cryptoaccount:set-second-passphrase";

describe(`${commandName} command`, () => {
    beforeEach(() => {
        process.env.DEV_MODE = "true";
    });

    describe("Should exit", () => {
        test.stderr()
            .stub(cli, "prompt", () => async () =>
                "cactus cute please spirit reveal raw goose emotion latin subject forum panic",
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get("/wallets/0283c5017e5d19847d2362623559274974ceb5f40cdaafe38c0e7ac5348825056c").reply(200, {
                    data: {
                        address: "DMBbnpPRge4NprMxNDyLkBa1bRq7QjvqRc",
                        publicKey: "0283c5017e5d19847d2362623559274974ceb5f40cdaafe38c0e7ac5348825056c",
                        balance: 999974660000000,
                        isDelegate: false,
                        secondPublicKey: "second public key",
                    },
                }),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/node/configuration/crypto`).reply(200, NODE_CONFIGURATION_CRYPTO),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api
                    .get("/blockchain")
                    .once()
                    .reply(200, {
                        data: {
                            supply: 2119999400000000,
                            block: {
                                height: 10,
                            },
                        },
                    }),
            )
            .command([commandName, "-n", "dalinet", "--verbose"])
            // tslint:disable-next-line:no-empty
            .catch(_ => {})
            .it("on existing second passphrase", ctx => {
                expect(ctx.stderr).to.equal(
                    "» :stop: A second passphrase already exists. Not possible to change it.;\n",
                );
            });
    });
});
