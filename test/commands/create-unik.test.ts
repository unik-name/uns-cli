import { expect, test } from "@oclif/test";
import { crypto, slots } from "@uns/crypto";
import { NETWORKS } from "../../src/config";
import {
    meta,
    outputCases,
    shouldExit,
    transaction,
    TRANSACTION_ID,
    TRANSACTION_TIMESTAMP,
    UNIK_ID,
} from "../__fixtures__/commands/create-unik";

const applyTestCase = (testCase: any) => {
    test.nock(NETWORKS.devnet.backend, api =>
        api.post("/api/v1/unik-name-fingerprint", { explicitValue: "bob", type: "individual" }).reply(200, {
            data: {
                fingerprint: UNIK_ID,
            },
        }),
    )
        .nock(NETWORKS.devnet.url, api =>
            api
                .post("/api/v2/transactions", {
                    transactions: [transaction],
                })
                .reply(200, {}),
        )

        .nock(NETWORKS.devnet.url, api =>
            api.get(`/api/v2/transactions/${TRANSACTION_ID}`).reply(200, {
                data: {
                    id: TRANSACTION_ID,
                    confirmations: 20,
                },
                chainmeta: meta,
            }),
        )
        .stdout()
        .command(testCase.args)
        .it(testCase.description, ctx => {
            expect(ctx.stdout).to.equal(testCase.expected);
        });
};

const applyExitCase = (exitCase: any) => {
    test.command(exitCase.args)
        .exit(exitCase.exitCode)
        // tslint:disable-next-line:no-empty
        .it(exitCase.description, _ => {});
};

describe("creat-unik command", () => {
    // Mock function that create transaction timestamp
    jest.spyOn(slots, "getTime").mockImplementation(() => TRANSACTION_TIMESTAMP);

    // Mock function that create transaction id
    jest.spyOn(crypto, "getId").mockImplementation(() => TRANSACTION_ID);

    shouldExit.forEach(exitCase => applyExitCase(exitCase));

    jest.setTimeout(10000);
    outputCases.forEach(testCase => applyTestCase(testCase));
});
