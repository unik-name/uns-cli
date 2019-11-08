import { expect, test } from "@oclif/test";
import { UNSConfig } from "@uns/ts-sdk";
import { getRootFromUrl } from "../../src/utils";
import { outputCases } from "../__fixtures__/commands/status";

const applyTestCase = (testCase: any) => {
    test.nock(getRootFromUrl(UNSConfig.devnet.chain.url), api =>
        api.get("/api/blocks/getSupply").reply(200, {
            supply: 2119999400000000,
            success: true,
        }),
    )
        .nock(UNSConfig.devnet.chain.url, api =>
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
        .nock(UNSConfig.devnet.chain.url, api =>
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
