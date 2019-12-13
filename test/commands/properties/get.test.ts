import { expect, test } from "@oclif/test";
import {
    EXPECTED_PROPERTY_OUTPUT,
    EXPECTED_PROPERTY_WITH_CHAINMETA_OUTPUT,
    PROPERTY_RESULT,
    PROPERTY_RESULT_FOR_CONSISTENCY_FAIL,
    shouldExit,
    TRANSACTION_ID,
    TRANSACTION_RESULT,
    UNIK_ID,
    UNIK_RESULT,
} from "../../__fixtures__/commands/properties/get";
import {
    applyExitCase,
    NODE_CONFIGURATION,
    NODE_CONFIGURATION_CRYPTO,
    NODE_STATUS,
    UNS_CLIENT_FOR_TESTS,
} from "../../__fixtures__/commons";

const commandName: string = "properties:get";

describe(`${commandName} command`, () => {
    beforeEach(() => {
        process.env.DEV_MODE = "true";
    });

    describe("Exit cases", () => {
        shouldExit.forEach(exitCase => applyExitCase(exitCase));

        test.nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api.get(`/uniks/${UNIK_ID}/properties/type`).reply(200, PROPERTY_RESULT_FOR_CONSISTENCY_FAIL),
        )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/uniks/${UNIK_ID}`).reply(200, UNIK_RESULT),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/transactions/${TRANSACTION_ID}`).reply(200, TRANSACTION_RESULT),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/node/configuration/crypto`).reply(200, NODE_CONFIGURATION_CRYPTO),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/node/configuration`).reply(200, NODE_CONFIGURATION),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/node/status`).reply(200, NODE_STATUS),
            )
            .command([commandName, "-n", "dalinet", "--unikid", UNIK_ID, "-k", "type", "--chainmeta"])
            .exit(1)
            // tslint:disable-next-line:no-empty
            .it("Should exit with data consistency error", _ => {});
    });

    describe("Run cases", () => {
        test.nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api.get(`/uniks/${UNIK_ID}/properties/type`).reply(200, PROPERTY_RESULT),
        )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/uniks/${UNIK_ID}`).reply(200, UNIK_RESULT),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/transactions/${TRANSACTION_ID}`).reply(200, TRANSACTION_RESULT),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/node/configuration/crypto`).reply(200, NODE_CONFIGURATION_CRYPTO),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/node/configuration`).reply(200, NODE_CONFIGURATION),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/node/status`).reply(200, NODE_STATUS),
            )
            .stdout()
            .command([commandName, "-n", "dalinet", "--unikid", UNIK_ID, "-k", "type"])
            .it("Should retrieve property type without chainmeta", ctx => {
                expect(ctx.stdout).to.equal(EXPECTED_PROPERTY_OUTPUT);
            });

        test.nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api.get(`/uniks/${UNIK_ID}/properties/type`).reply(200, PROPERTY_RESULT),
        )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/uniks/${UNIK_ID}`).reply(200, UNIK_RESULT),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/transactions/${TRANSACTION_ID}`).reply(200, TRANSACTION_RESULT),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/node/configuration/crypto`).reply(200, NODE_CONFIGURATION_CRYPTO),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/node/configuration`).reply(200, NODE_CONFIGURATION),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
                api.get(`/node/status`).reply(200, NODE_STATUS),
            )
            .stdout()
            .command([commandName, "-n", "dalinet", "--unikid", UNIK_ID, "-k", "type", "--chainmeta"])
            .it("Should retrieve property type with chainmeta", ctx => {
                expect(ctx.stdout).to.equal(EXPECTED_PROPERTY_WITH_CHAINMETA_OUTPUT);
            });
    });
});
