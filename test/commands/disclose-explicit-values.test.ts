import { DiscloseExplicitValuesCommand } from "../../src/commands/disclose-explicit-values";
import { shouldExit, transaction } from "../__fixtures__/commands/disclose-explicit-values";
import { applyExitCase, EMPTY_COMMAND_CONFIG } from "../__fixtures__/commons";

describe("disclose-explicit-values command", () => {
    describe("Exit cases", () => {
        shouldExit.forEach(exitCase => applyExitCase(exitCase));
    });

    describe("Unit tests", () => {
        let command: DiscloseExplicitValuesCommand;

        beforeEach(() => {
            command = new DiscloseExplicitValuesCommand([], EMPTY_COMMAND_CONFIG);
        });

        describe("formatResult", () => {
            it("should match with existing transaction", async () => {
                const infoFunction = jest.spyOn(command, "info");
                const errorFunction = jest.spyOn(command, "error");
                const result = await command.formatResult(transaction, transaction.id);

                expect(infoFunction.mock.calls.length).toEqual(1);
                expect(errorFunction.mock.calls.length).toEqual(0);

                expect(result).toEqual({
                    data: {
                        transaction: transaction.id,
                        confirmations: transaction.confirmations,
                    },
                });
            });

            it("should match with existing transaction", async () => {
                const infoFunction = jest.spyOn(command, "info");
                const errorFunction = jest.spyOn(command, "error");

                jest.spyOn(command, "getTransactionUrl").mockImplementation(_ => "URL");

                try {
                    await command.formatResult(undefined, transaction.id);
                    expect(true).toBeFalsy();
                } catch (e) {
                    expect(e.message).toEqual(
                        "Transaction not found yet, the network can be slow. Check this url in a while: URL",
                    );
                }

                expect(infoFunction.mock.calls.length).toEqual(0);
                expect(errorFunction.mock.calls.length).toEqual(1);
            });
        });
    });
});
