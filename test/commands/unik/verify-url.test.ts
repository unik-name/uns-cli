import * as SDK from "@uns/ts-sdk";
import { VerifyUrlCommand } from "../../../src/commands/unik/verify-url";
import { EMPTY_COMMAND_CONFIG } from "../../__fixtures__/commons";
const commandName: string = "VerifyUrlCommand";

describe(`${commandName} command`, () => {
    describe("units", () => {
        describe("getProperties", () => {
            let verifyCommand: VerifyUrlCommand;
            const flags: Record<string, any> = {
                "url-name": "myUrl",
                url: "http://www.my.url",
            };
            const tokenId: string = "2bdd2a25f8abb77db342c41098da2fa00eccec34a182887dcae67503e7fd0d97";

            beforeEach(() => {
                const commandArgs: string[] = ["--url-name", "myUrl", "--url", "http://www.my.url"];
                verifyCommand = new VerifyUrlCommand(commandArgs, EMPTY_COMMAND_CONFIG);
            });

            it("without usr property", async () => {
                jest.spyOn(SDK, "getPropertyValue").mockRejectedValue({});

                // @ts-ignore
                const propertiesToUpdate = await verifyCommand.getProperties(flags, tokenId);

                expect(propertiesToUpdate).toEqual({
                    "Verified/URL/myUrl": "http://www.my.url",
                });
            });

            it("with usr property", async () => {
                jest.spyOn(SDK, "getPropertyValue").mockResolvedValue("http://www.my.url");

                // @ts-ignore
                const propertiesToUpdate = await verifyCommand.getProperties(flags, tokenId);

                expect(propertiesToUpdate).toEqual({
                    "usr/URL/myUrl": null,
                    "Verified/URL/myUrl": "http://www.my.url",
                });
            });
        });
    });
});
