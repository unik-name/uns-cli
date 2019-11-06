import { expect, test } from "@oclif/test";
import { NETWORKS } from "../../src/config";
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
} from "../__fixtures__/commands/get-property-value";
import { applyExitCase } from "../__fixtures__/commons";

describe("get-property-value command", () => {
    describe("Exit cases", () => {
        shouldExit.forEach(exitCase => applyExitCase(exitCase));

        test.nock(NETWORKS.devnet.url, api =>
            api.get(`/api/v2/uniks/${UNIK_ID}/properties/type`).reply(200, PROPERTY_RESULT_FOR_CONSISTENCY_FAIL),
        )
            .nock(NETWORKS.devnet.url, api => api.get(`/api/v2/uniks/${UNIK_ID}`).reply(200, UNIK_RESULT))
            .nock(NETWORKS.devnet.url, api =>
                api.get(`/api/v2/transactions/${TRANSACTION_ID}`).reply(200, TRANSACTION_RESULT),
            )
            .command(["get-property-value", "-n", "devnet", "--unikid", UNIK_ID, "-k", "type", "--chainmeta"])
            .exit(1)
            // tslint:disable-next-line:no-empty
            .it("Should exit with data consistency error", _ => {});
    });

    describe("Run cases", () => {
        test.nock(NETWORKS.devnet.url, api =>
            api.get(`/api/v2/uniks/${UNIK_ID}/properties/type`).reply(200, PROPERTY_RESULT),
        )
            .nock(NETWORKS.devnet.url, api => api.get(`/api/v2/uniks/${UNIK_ID}`).reply(200, UNIK_RESULT))
            .nock(NETWORKS.devnet.url, api =>
                api.get(`/api/v2/transactions/${TRANSACTION_ID}`).reply(200, TRANSACTION_RESULT),
            )
            .stdout()
            .command(["get-property-value", "-n", "devnet", "--unikid", UNIK_ID, "-k", "type"])
            .it("Should retrieve property type without chainmeta", ctx => {
                expect(ctx.stdout).to.equal(EXPECTED_PROPERTY_OUTPUT);
            });

        test.nock(NETWORKS.devnet.url, api =>
            api.get(`/api/v2/uniks/${UNIK_ID}/properties/type`).reply(200, PROPERTY_RESULT),
        )
            .nock(NETWORKS.devnet.url, api => api.get(`/api/v2/uniks/${UNIK_ID}`).reply(200, UNIK_RESULT))
            .nock(NETWORKS.devnet.url, api =>
                api.get(`/api/v2/transactions/${TRANSACTION_ID}`).reply(200, TRANSACTION_RESULT),
            )
            .stdout()
            .command(["get-property-value", "-n", "devnet", "--unikid", UNIK_ID, "-k", "type", "--chainmeta"])
            .it("Should retrieve property type with chainmeta", ctx => {
                expect(ctx.stdout).to.equal(EXPECTED_PROPERTY_WITH_CHAINMETA_OUTPUT);
            });
    });
});
