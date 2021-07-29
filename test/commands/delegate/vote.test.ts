import { commandName, meta, shouldExit, wallet } from "../../__fixtures__/commands/delegate/vote";
import { applyExitCase } from "../../__fixtures__/commons";

jest.mock("@uns/ts-sdk", () => ({
    ...jest.requireActual("@uns/ts-sdk"),
    didResolve: () =>
        Promise.resolve({
            data: { ownerAddress: wallet.address, unikid: "unikid" },
            chainmeta: meta,
            confirmations: 12,
        }),
    throwIfNotAllowedToVote: jest.fn,
}));

describe(`${commandName} command`, () => {
    beforeEach(() => {
        process.env.DEV_MODE = "true";
    });

    describe("Exit cases", () => {
        shouldExit.forEach((exitCase) => applyExitCase(exitCase));
    });
});
