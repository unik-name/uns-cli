import { color } from "@oclif/color";
import util from "util";
import { BaseCommand } from "./baseCommand";

interface LoggerLevelOutput {
    color: string;
    output: "stderr" | "stdout";
}

const LOGGER_COLOR_BY_LEVEL: { [_: string]: LoggerLevelOutput } = {
    stop: {
        color: "#ff0000",
        output: "stderr",
    },
    warn: {
        color: "#ffa407",
        output: "stderr",
    },
    info: {
        color: "#6ecbfb",
        output: "stdout",
    },
    debug: {
        color: "#fbfa6e",
        output: "stdout",
    },
};

export const logWithLevel = (level: string, message: string, ...args: any[]): void => {
    const loggerConfig = LOGGER_COLOR_BY_LEVEL[level];
    const log = color.hex(loggerConfig.color)(`» :${level}: ${util.format(message, ...args)};\n`);
    process[loggerConfig.output].write(log);
};

export const bindConsole = (): void => {
    console.info = (message?: any, ...optionalParams: any[]) => {
        logWithLevel("info", message, ...optionalParams);
    };

    console.warn = (message?: any, ...optionalParams: any[]) => {
        logWithLevel("warn", message, ...optionalParams);
    };

    console.error = (message?: any, ...optionalParams: any[]) => {
        logWithLevel("stop", message, ...optionalParams);
    };

    console.debug = (message?: any, ...optionalParams: any[]) => {
        logWithLevel("debug", message, ...optionalParams);
    };
};

export const disableLogs = (command: BaseCommand): void => {
    const disableFunction = () => {
        /*doNothing*/
    };

    console = {
        ...console,
        debug: disableFunction,
        log: disableFunction,
        info: disableFunction,
    };

    command.log = disableFunction;
    command.info = disableFunction;

    // Do not override console.error, command.error, command.warn and command.stop
};
