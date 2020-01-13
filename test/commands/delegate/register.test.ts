import { commandName, shouldExit } from "../../__fixtures__/commands/delegate/register";
import { applyExitCase } from "../../__fixtures__/commons";

describe(`${commandName} command`, () => {
    beforeEach(() => {
        process.env.DEV_MODE = "true";
    });

    describe("Exit cases", () => {
        shouldExit.forEach(exitCase => applyExitCase(exitCase));
    });
});
