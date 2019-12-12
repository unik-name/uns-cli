import { CommandOutput, OUTPUT_FORMAT } from "../../src/formater";

const formatInput: CommandOutput = {
    Height: 157555,
    Network: "sandbox",
    "Supply DUNS": "21315110 DUNS",
    "Supply UNIKs": "140 UNIKs",
    "Active delegates": 23,
    "Last block": "https://explorer.sandbox.uns.network/block/157555",
};

describe("Formaters", () => {
    it("YAML", async () => {
        const formatOutput = OUTPUT_FORMAT.yaml.action(formatInput);
        // tslint:disable-next-line
        const expectedOutput = `Height: 157555
Network: sandbox
Supply DUNS: 21315110 DUNS
Supply UNIKs: 140 UNIKs
Active delegates: 23
Last block: https://explorer.sandbox.uns.network/block/157555`;
        expect(formatOutput).toEqual(expectedOutput);
    });

    it("RAW", async () => {
        const formatOutput = OUTPUT_FORMAT.raw.action(formatInput);
        // tslint:disable-next-line
        expect(formatOutput).toEqual(
            `157555
sandbox
21315110 DUNS
140 UNIKs
23
https://explorer.sandbox.uns.network/block/157555`,
        );
    });

    it("JSON", async () => {
        const formatOutput = OUTPUT_FORMAT.json.action(formatInput);
        // tslint:disable-next-line
        expect(formatOutput).toEqual(
            `{
  "Height": 157555,
  "Network": "sandbox",
  "Supply DUNS": "21315110 DUNS",
  "Supply UNIKs": "140 UNIKs",
  "Active delegates": 23,
  "Last block": "https://explorer.sandbox.uns.network/block/157555"
}`,
        );
    });

    it("TABLE", async () => {
        const formatOutput = OUTPUT_FORMAT.table.action([formatInput]);
        // tslint:disable-next-line
        expect(formatOutput).toStrictEqual(
            `Height;Network;Supply DUNS;Supply UNIKs;Active delegates;Last block
157555;sandbox;21315110 DUNS;140 UNIKs;23;https://explorer.sandbox.uns.network/block/157555`,
        );
    });
});
