import test from "@oclif/test";
import { SendCommand } from "../../src/commands/unik/send";
import { commandName, shouldExit } from "../__fixtures__/commands/baseCommand";
import { applyExitCase, EMPTY_COMMAND_CONFIG } from "../__fixtures__/commons";

describe("BaseCommand", () => {
    describe("Exit cases", () => {
        shouldExit.forEach((exitCase) => applyExitCase(exitCase));

        const network = "customNetwork";
        test.env({ UNS_NETWORK: network })
            .command([commandName])
            .catch((err) => expect(err.message.match(`Expected --network=${network} to be one of`)))
            // tslint:disable-next-line:no-empty
            .it("Should use UNS_NETWORK env var then throw error", (_) => {});
    });

    describe("utilities", () => {
        // Send command is just use here to simulate any command, BaseCommand is abstract, can't be instantiated
        it("isFlagSet --fee=valeur", () => {
            const fees = 100000;
            const sendCommand = new SendCommand(["--sato", `--fee=${fees}`], EMPTY_COMMAND_CONFIG);
            expect(sendCommand.isFlagSet("fee")).toBeTruthy();
            expect(sendCommand.isFlagSet("fee", "f")).toBeTruthy();
        });

        it("isFlagSet --fee valeur", () => {
            const fees = 100000;
            const sendCommand = new SendCommand(["--sato", "--fee", `${fees}`], EMPTY_COMMAND_CONFIG);
            expect(sendCommand.isFlagSet("fee")).toBeTruthy();
            expect(sendCommand.isFlagSet("fee", "f")).toBeTruthy();
        });

        it("isFlagSet -f=valeur", () => {
            const fees = 100000;
            const sendCommand = new SendCommand(["--sato", `-f=${fees}`], EMPTY_COMMAND_CONFIG);
            expect(sendCommand.isFlagSet("fee")).toBeFalsy();
            expect(sendCommand.isFlagSet("fee", "f")).toBeTruthy();
        });

        it("isFlagSet -f valeur", () => {
            const fees = 100000;
            const sendCommand = new SendCommand(["--sato", "-f", `${fees}`], EMPTY_COMMAND_CONFIG);
            expect(sendCommand.isFlagSet("fee")).toBeFalsy();
            expect(sendCommand.isFlagSet("fee", "f")).toBeTruthy();
        });

        it("isFlagSet returns false if flag is absent", () => {
            const sendCommand = new SendCommand(["--sato"], EMPTY_COMMAND_CONFIG);
            expect(sendCommand.isFlagSet("fee")).toBeFalsy();
            expect(sendCommand.isFlagSet("fee", "f")).toBeFalsy();
        });
    });
});
