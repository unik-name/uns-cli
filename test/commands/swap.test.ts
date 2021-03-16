import { shouldExit } from "../__fixtures__/commands/swap";
import { applyExitCase } from "../__fixtures__/commons";

describe("swap command", () => {
    beforeEach(() => {
        process.env.DEV_MODE = "true";
    });
    shouldExit.forEach((exitCase) => applyExitCase(exitCase));
});
