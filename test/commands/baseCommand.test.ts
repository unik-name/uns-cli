import test from "@oclif/test";
import { commandName, shouldExit } from "../__fixtures__/commands/baseCommand";
import { applyExitCase } from "../__fixtures__/commons";

describe("BaseCommand", () => {
    describe("Exit cases", () => {
        shouldExit.forEach(exitCase => applyExitCase(exitCase));

        const network = "customNetwork";
        test.env({ UNS_NETWORK: network })
            .command([commandName])
            .catch(err => expect(err.message.match(`Expected --network=${network} to be one of`)))
            // tslint:disable-next-line:no-empty
            .it("Should use UNS_NETWORK env var then throw error", _ => {});
    });
});
