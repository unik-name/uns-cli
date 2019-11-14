import Config from "@oclif/config";
import { test } from "@oclif/test";

export const applyExitCase = (exitCase: any) => {
    test.command(exitCase.args)
        .exit(exitCase.exitCode)
        // tslint:disable-next-line:no-empty
        .it(exitCase.description, _ => {});
};

export const getMeta = (blockHeight: number) => {
    return {
        height: `${blockHeight}`,
        timestamp: {
            epoch: 79391124,
            unix: 1569488724,
            human: "2019-09-26T09:05:24.000Z",
        },
    };
};

export const EMPTY_COMMAND_CONFIG: Config.IConfig = {} as Config.IConfig;
