import { color } from "@oclif/color";
import Command from "@oclif/command";
import util from "util";

const LOGGER_COLOR_BY_LEVEL: any = {
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
    message = typeof message === "string" ? message : util.inspect(message);
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

export const disableLogs = (command: Command): void => {
    const disableFunction = (...args) => {
        /*doNothing*/
    };
    ["debug", "log", "info"].forEach(level => (console[level] = disableFunction));
    ["log", "info"].forEach(level => (command[level] = disableFunction));
    // Do not override console.error, command.error, command.warn and command.stop
};
