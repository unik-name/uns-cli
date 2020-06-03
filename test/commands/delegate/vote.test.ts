import * as SDK from "@uns/ts-sdk";
import { commandName, meta, shouldExit, wallet } from "../../__fixtures__/commands/delegate/vote";
import { applyExitCase } from "../../__fixtures__/commons";

describe(`${commandName} command`, () => {
    beforeEach(() => {
        process.env.DEV_MODE = "true";
    });

    describe("Exit cases", () => {
        jest.spyOn(SDK, "didResolve").mockResolvedValue({
            data: { ownerAddress: wallet.address, unikid: "unikid" },
            chainmeta: meta,
            confirmations: 12,
        });

        jest.spyOn(SDK, "getPropertyValue").mockResolvedValueOnce({
            data: "2",
            chainmeta: meta,
        });

        shouldExit.forEach(exitCase => applyExitCase(exitCase));
    });
});
