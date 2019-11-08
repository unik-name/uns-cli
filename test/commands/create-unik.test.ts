import { expect, test } from "@oclif/test";
import { crypto, slots } from "@uns/crypto";
import { UNSConfig } from "@uns/ts-sdk";
import {
    meta,
    outputCases,
    shouldExit,
    transaction,
    TRANSACTION_ID,
    TRANSACTION_TIMESTAMP,
    UNIK_ID,
} from "../__fixtures__/commands/create-unik";
import { applyExitCase } from "../__fixtures__/commons";

const applyTestCase = (testCase: any) => {
    test.nock(UNSConfig.devnet.service.url, api =>
        api.post("/unik-name-fingerprint", { explicitValue: "bob", type: "individual" }).reply(200, {
            data: {
                fingerprint: UNIK_ID,
            },
        }),
    )
        .nock(UNSConfig.devnet.chain.url, api =>
            api
                .post("/transactions", {
                    transactions: [transaction],
                })
                .reply(200, {}),
        )

        .nock(UNSConfig.devnet.chain.url, api =>
            api.get(`/transactions/${TRANSACTION_ID}`).reply(200, {
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

describe("creat-unik command", () => {
    describe("Exit cases", () => {
        shouldExit.forEach(exitCase => applyExitCase(exitCase));
    });

    describe("Run cases", () => {
        // Mock function that create transaction timestamp
        jest.spyOn(slots, "getTime").mockImplementation(() => TRANSACTION_TIMESTAMP);

        // Mock function that create transaction id
        jest.spyOn(crypto, "getId").mockImplementation(() => TRANSACTION_ID);

        jest.setTimeout(10000);
        outputCases.forEach(testCase => applyTestCase(testCase));
    });
});
