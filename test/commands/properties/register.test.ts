import { expect, test } from "@oclif/test";
import { Transactions } from "@uns/ark-crypto";
import { CertifiedNftUpdateTransaction } from "@uns/crypto";
import { NODE_CONFIGURATION_CRYPTO, UNS_CLIENT_FOR_TESTS } from "../../__fixtures__/commons";
import {
    UNIK_ID,
    WALLET,
    WALLET_RESULT,
    URL,
    PASSPHRASE,
    UNIK_RESULT,
} from "../../__fixtures__/commands/properties/verify";

import { PropertyRegisterCommand } from "../../../src/commands/properties/register";

const commandName: string = "properties:register";

describe(`${commandName} command`, () => {
    beforeAll(() => {
        Transactions.TransactionRegistry.registerTransactionType(CertifiedNftUpdateTransaction);
    });
    beforeEach(() => {
        process.env.DEV_MODE = "true";
    });

    describe("Run cases", () => {
        test.nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, (api) =>
            api.get(`/uniks/${UNIK_ID}`).twice().reply(200, UNIK_RESULT),
        )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, (api) =>
                api.get(`/wallets/${WALLET}`).reply(200, WALLET_RESULT),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, (api) =>
                api.get(`/node/configuration/crypto`).reply(200, NODE_CONFIGURATION_CRYPTO),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, (api) =>
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
            .command([commandName, UNIK_ID, "-n", "dalinet", "-V", URL, "--passphrase", PASSPHRASE])
            .it("Should generate JWT token", (ctx) => {
                const parsed = JSON.parse(ctx.stdout);
                expect(parsed.data).to.have.property("type", "url");
                expect(parsed.data).to.have.property("value", URL);
                expect(parsed.data).to.have.property("filename", PropertyRegisterCommand.JWT_FILENAME);
                expect(parsed.data).to.have.property("verificationKey");
                expect(parsed.data).to.have.property("expirationDate");
            });
    });
});
