import { test } from "@oclif/test";
import { shouldExit } from "../__fixtures__/commands/send";

const applyExitCase = (exitCase: any) => {
    test.command(exitCase.args)
        .exit(exitCase.exitCode)
        // tslint:disable-next-line:no-empty
        .it(exitCase.description, _ => {});
};

describe("send command", () => {
    shouldExit.forEach(exitCase => applyExitCase(exitCase));
});
