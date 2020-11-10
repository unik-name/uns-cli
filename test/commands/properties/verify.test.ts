import { expect, test } from "@oclif/test";
import { Transactions } from "@uns/ark-crypto";
import { CertifiedNftUpdateTransaction } from "@uns/crypto";
import * as SDK from "@uns/ts-sdk";
import { BLOCKCHAIN, NODE_CONFIGURATION_CRYPTO, UNS_CLIENT_FOR_TESTS } from "../../__fixtures__/commons";
import {
    URL_VERIFY_TRANSACTION,
    UNIK_ID,
    WALLET,
    WALLET_RESULT,
    PASSPHRASE,
    RAWJWT,
    UNIK_RESULT,
} from "../../__fixtures__/commands/properties/verify";

import { PropertyRegisterCommand } from "../../../src/commands/properties/register";
import * as fs from "fs";

const commandName: string = "properties:verify";
describe(`${commandName} command`, () => {
    beforeAll(() => {
        Transactions.TransactionRegistry.registerTransactionType(CertifiedNftUpdateTransaction);
    });
    beforeEach(() => {
        process.env.DEV_MODE = "true";
        fs.writeFileSync(PropertyRegisterCommand.JWT_FILENAME, RAWJWT);
    });

    describe("Run cases", () => {
        jest.spyOn(SDK, "createCertifiedNftUpdateTransaction").mockResolvedValueOnce(URL_VERIFY_TRANSACTION);

        test.nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.network, (api) =>
            api.get(`/uniks/${UNIK_ID}`).twice().reply(200, UNIK_RESULT),
        )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.network, (api) =>
                api.get(`/wallets/${WALLET}`).twice().reply(200, WALLET_RESULT),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.network, (api) =>
                api.get(`/node/configuration/crypto`).reply(200, NODE_CONFIGURATION_CRYPTO),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.network, (api) =>
                api.get("/blockchain").reply(200, BLOCKCHAIN),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.network, (api) =>
                api.post(/transactions/).reply(200, {
                    data: {
                        accept: [],
                        broadcast: [],
                        invalid: [],
                        excess: [],
                    },
                }),
            )
            .stdout()
            .command([
                commandName,
                UNIK_ID,
                "-n",
                "dalinet",
                "--url-channel",
                `html`,
                "--passphrase",
                PASSPHRASE,
                "--await-confirmation",
                "0",
            ])
            .it("Should verify URL", (ctx) => {
                expect(ctx.stdout).to.equal(`{
  "transaction": "7ce8777a1ba0d5979cda8e53fa59d4d5e6b5d50464db90e0ae95b69381d6f6a0"
}
`);
            });
    });
    afterEach(() => {
        fs.unlinkSync(PropertyRegisterCommand.JWT_FILENAME);
    });
});
