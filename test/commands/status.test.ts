import { expect, test } from "@oclif/test";
import { outputCases } from "../__fixtures__/commands/status";
import { UNS_CLIENT_FOR_TESTS } from "../__fixtures__/commons";

const applyTestCase = (testCase: any) => {
    test.nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
        api.get("/blockchain").reply(200, {
            data: {
                supply: 2119999400000000,
            },
        }),
    )
        .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url, api =>
            api.get("/nfts").reply(200, {
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
            api.get("/node/status").reply(200, {
                data: {
                    synced: true,
                    now: 100015,
                    blocksCount: 0,
                },
            }),
        )
        .env({ UNS_NETWORK: testCase.UNS_NETWORK })
        .stdout()
        .command(testCase.args)
        .it(testCase.description, ctx => {
            expect(ctx.stdout).to.equal(testCase.expected);
        });
};

describe("status command", () => {
    outputCases.forEach(testCase => applyTestCase(testCase));
});
