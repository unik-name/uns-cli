import { shouldExit } from "../../__fixtures__/commands/send";
import { applyExitCase } from "../../__fixtures__/commons";

describe("send command", () => {
    beforeEach(() => {
        process.env.DEV_MODE = "true";
    });
    shouldExit.forEach((exitCase) => applyExitCase(exitCase));
});
