import { test } from "@oclif/test";

export const applyExitCase = (exitCase: any) => {
    test.command(exitCase.args)
        .exit(exitCase.exitCode)
        // tslint:disable-next-line:no-empty
        .it(exitCase.description, _ => {});
};
