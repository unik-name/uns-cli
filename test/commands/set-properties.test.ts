import { expect, test } from "@oclif/test";

const UNIK_ID = "51615becbd39ad96344919dffa7b972f293b0a3973b05145fd6d0a1a20cac169";
const PASSPHRASE = "reveal front short spend enjoy label element text alert answer select bright";
describe("set-properties command", () => {
    beforeEach(() => {
        process.env.DEV_MODE = "true";
    });

    describe("Schema validation", () => {
        const tooLongValue =
            "toolong1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
        test.stderr()
            .command([
                "set-properties",
                "-n",
                "dalinet",
                "--unikid",
                UNIK_ID,
                "--passphrase",
                PASSPHRASE,
                "--properties",
                `tooLong:${tooLongValue}`,
            ])
            // tslint:disable-next-line:no-empty
            .catch(_ => {})
            .it("Should throw too long property", ctx => {
                expect(ctx.stderr).to.equal(
                    "» :stop: data.asset.nft['unik'].properties['tooLong'] should NOT be longer than 255 characters;\n",
                );
            });
    });
});
