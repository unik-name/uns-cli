import { Command, flags } from "@oclif/command";
import { FlagInvalidOptionError } from "@oclif/parser/lib/errors";
import { Client, configManager } from "@uns/crypto";
import { Network, UNSClient } from "@uns/ts-sdk";
import { cli } from "cli-ux";
import { UNSCLIAPI } from "./api";
import { Formater, getFormatFlag, OUTPUT_FORMAT } from "./formater";
import * as LOGGER from "./logger";
import * as UTILS from "./utils";

export abstract class BaseCommand extends Command {
    public static baseFlags = {
        help: flags.help({ char: "h" }),
        network: flags.string({
            char: "n",
            description: "Network used to create UNIK nft token",
            required: true,
            options: UTILS.getNetworksList(),
            env: "UNS_NETWORK",
        }),
        verbose: flags.boolean({
            char: "v",
            description: "Detailed logs",
        }),
        node: flags.string({
            description: "URL of custom node representing blockchain endpoint",
            env: "UNS_NODE",
        }),
    };

    public client: Client;
    public api: UNSCLIAPI;
    protected unsClient: UNSClient;
    protected verbose: boolean;

    private formater;

    public async init() {
        // Add dynamic format flag
        Object.assign(this.getCommand().flags, getFormatFlag(this.getDefaultFormat(), this.getAvailableFormats()));
        await super.init();
    }

    public async run() {
        const { flags, args } = this.parse(this.getCommand());

        // Set formater
        this.formater = OUTPUT_FORMAT[flags.format];
        this.verbose = flags.verbose;

        if (this.verbose) {
            LOGGER.bindConsole();
        } else {
            LOGGER.disableLogs(this);
        }

        /**
         * Configuration
         */

        // This happen when providing network through env var
        // see Oclif PR: https://github.com/oclif/parser/pull/64
        // will be removed if PR is accepted
        if (!UTILS.getNetworksList().includes(flags.network)) {
            throw new FlagInvalidOptionError(BaseCommand.baseFlags.network, flags.network);
        }

        const networkName: Network = flags.network === "local" ? "dalinet" : flags.network;

        const networkPreset = configManager.getPreset(networkName);

        networkPreset.network.name = flags.network;

        this.api = new UNSCLIAPI(networkPreset, flags.node);

        this.client = new Client(networkPreset);

        this.unsClient = new UNSClient(networkName, flags.node);

        if (UTILS.isDevMode()) {
            this.info("DEV MODE IS ACTIVATED");
        }
        try {
            this.info(`node: ${this.api.getCurrentNode()}`);
            const commandResult = await this.do(flags, args);
            if (commandResult && typeof commandResult === "string") {
                super.log(commandResult);
            } else {
                if (commandResult && Object.keys(commandResult).length > 0) {
                    // Keep super.log to force log
                    super.log(
                        this.formater && this.formater.action ? this.formater.action(commandResult) : commandResult,
                    );
                }
            }
        } catch (globalCatchException) {
            this.stop(globalCatchException.message);
            this.exit(1);
        }
    }

    public info(message: string, ...args: any[]): void {
        if (this.verbose || this._helpOverride()) {
            LOGGER.logWithLevel("info", message, ...args);
        }
    }

    public warn(message: string, ...args: any[]): void {
        LOGGER.logWithLevel("warn", message, ...args);
    }

    /**
     * Always log and exit
     * @param message
     * @param args
     */
    public stop(message: string, ...args: any[]): void {
        LOGGER.logWithLevel("stop", message, ...args);
    }

    public actionStart(msg: string) {
        if (this.verbose) {
            cli.action.start(msg);
        }
    }

    public actionStop() {
        if (this.verbose) {
            cli.action.stop();
        }
    }

    /**
     * Check transaction api util retrieved transaction has {expectedConfirmations} confirmations during {retry} block times maximum
     * @param blockTime
     * @param transactionId
     * @param numberOfRetry
     * @param expectedConfirmations
     */
    public async waitTransactionConfirmations(
        blockTime: number,
        transactionId: string,
        numberOfRetry: number = 0,
        expectedConfirmations: number = 0,
    ) {
        const transactionFromNetwork = await this.api.getTransaction(transactionId, blockTime * 1000);
        const confirmations = transactionFromNetwork ? transactionFromNetwork.confirmations : 0;
        if (confirmations < expectedConfirmations && numberOfRetry > 0) {
            return await this.waitTransactionConfirmations(
                blockTime,
                transactionId,
                numberOfRetry - 1,
                expectedConfirmations,
            );
        }
        return transactionFromNetwork;
    }

    public isFlagSet(flagName: string, flagChar?: string): boolean {
        return this.argv.some(
            arg =>
                arg === `--${flagName}` ||
                arg.startsWith(`--${flagName}=`) ||
                (flagChar && (arg === `-${flagChar}` || arg.startsWith(`-${flagChar}=`))),
        );
    }

    protected async withAction<T>(actionDescription: string, callback, ...args): Promise<T> {
        this.actionStart(actionDescription);
        try {
            return await callback(...args);
        } catch (e) {
            this.debug(e);
            throw e;
        } finally {
            this.actionStop();
        }
    }

    protected debug = (...args: any[]): void => {
        if (this.verbose || this._helpOverride()) {
            LOGGER.logWithLevel("debug", "", ...args);
        }
    };

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json];
    }

    protected getDefaultFormat(): Formater {
        return OUTPUT_FORMAT.json;
    }
    protected abstract do(flags: Record<string, any>, args?: Record<string, any>): Promise<any>;
    protected abstract getCommand(): typeof BaseCommand;

    protected logAttribute(label: string, value: string) {
        this.log(`\t${label}: ${value}`);
    }

    /**
     * Checks that all heights passed in parameter are equals
     * @param heights
     */
    protected checkDataConsistency(...heights: number[]) {
        if (!heights.every(v => v === heights[0])) {
            throw new Error("Unable to read right now. Please retry.");
        }
    }
}
