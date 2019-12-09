import { expect, test } from "@oclif/test";
import { outputCases } from "../__fixtures__/commands/status";
import {
    NODE_CONFIGURATION,
    NODE_CONFIGURATION_CRYPTO,
    NODE_STATUS,
    UNS_CLIENT_FOR_TESTS,
} from "../__fixtures__/commons";

const applyTestCase = (testCase: any) => {
    test.nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
        api.get("/blockchain").reply(200, {
            data: {
                supply: 2119999400000000,
            },
        }),
    )
        .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api.get("/uniks?limit=1").reply(200, {
                meta: {
                    totalCount: 1,
                },
                data: [
                    {
                        id: "51615becbd39ad96344919dffa7b972f293b0a3973b05145fd6d0a1a20cac169",
                        ownerId: "DQ377ETcezsrPamYsQE4FyiXkXcUxhSsFW",
                    },
                ],
            }),
        )
        .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api.get(`/node/configuration/crypto`).reply(200, NODE_CONFIGURATION_CRYPTO),
        )
        .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api
                .get(`/node/configuration`)
                .twice()
                .reply(200, NODE_CONFIGURATION),
        )
        .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api
                .get(`/node/status`)
                .twice()
                .reply(200, NODE_STATUS),
        )
        .env({ UNS_NETWORK: testCase.UNS_NETWORK })
        .stdout()
        .command(testCase.args)
        .it(testCase.description, ctx => {
            expect(ctx.stdout).to.equal(testCase.expected);
        });
};

describe("status command", () => {
    beforeEach(() => {
        process.env.DEV_MODE = "true";
    });
    outputCases.forEach(testCase => applyTestCase(testCase));
});
