import { expect, test } from "@oclif/test";
import { NETWORKS } from "../../src/config";
process.env.DEV_MODE = "true";
import * as UTILS from "../../src/utils";
import { outputCases } from "../__fixtures__/commands/status";

const applyTestCase = (testCase: any) => {
    test.nock(NETWORKS.devnet.url, api =>
        api.get("/api/blocks/getSupply").reply(200, {
            supply: 2119999400000000,
            success: true,
        }),
    )
        .nock(NETWORKS.devnet.url, api =>
            api.get("/api/v2/nfts").reply(200, {
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
        .nock(NETWORKS.devnet.url, api =>
            api.get("/api/v2/node/status").reply(200, {
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
    test.command(["status"])
        .exit(2)
        // tslint:disable-next-line:no-empty
        .it("Should exit with code 2 if network flag is not passed", _ => {});

    test.command(["status", "--network", "customNetwork"])
        .exit(2)
        // tslint:disable-next-line:no-empty
        .it("Should exit with code 2 if network is not known", _ => {});

    const network = "customNetwork";
    test.env({ UNS_NETWORK: network })
        .command(["status"])
        .catch(
            `Expected --network=${network} to be one of: ${UTILS.getNetworksListListForDescription()}
            See more help with --help`,
        )
        // tslint:disable-next-line:no-empty
        .it("Should use UNS_NETWORK env var then throw error", _ => {});

    outputCases.forEach(testCase => applyTestCase(testCase));
});
