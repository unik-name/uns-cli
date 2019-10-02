import { color } from "@oclif/color";
import { Command, flags as oFlags } from "@oclif/command";
import { Client, configManager } from "@uns/crypto";
import { cli } from "cli-ux";
import util from "util";
import { UNSCLIAPI } from "./api";
import { CommandOutput, Formater, getFormatFlag, NestedCommandOutput, OUTPUT_FORMAT } from "./formater";
import * as UTILS from "./utils";

export abstract class BaseCommand extends Command {
    public static baseFlags = {
        help: oFlags.help({ char: "h" }),
        network: oFlags.string({
            char: "n",
            description: "Network used to create UNIK nft token",
            required: true,
            options: UTILS.getNetworksList(),
            env: "UNS_NETWORK",
        }),
        verbose: oFlags.boolean({
            char: "v",
            description: "Detailed logs",
        }),
    };

    protected client: Client;
    protected api;
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

        if (!this.verbose) {
            this.disableLogs();
        }

        /**
         * Configuration
         */

        // This happen when providing network through env var
        if (!UTILS.getNetworksList().includes(flags.network)) {
            throw new Error(`Expected --network=${
                flags.network
            } to be one of: ${UTILS.getNetworksListListForDescription()}
            See more help with --help`);
        }

        const networkName = flags.network === "local" ? "testnet" : flags.network;

        const networkPreset = configManager.getPreset(networkName);

        networkPreset.network.name = flags.network;

        this.api = new UNSCLIAPI(networkPreset);

        this.client = new Client(networkPreset);

        try {
            if (UTILS.isDevMode()) {
                this.info("DEV MODE IS ACTIVATED");
            }
            this.info(`node: ${this.api.getCurrentNode()}`);
            const commandResult = await this.do(flags, args);
            if (commandResult && Object.keys(commandResult).length > 0) {
                // Keep super.log to force log
                super.log(this.formater && this.formater.action ? this.formater.action(commandResult) : commandResult);
            }
        } catch (globalCatchException) {
            this.promptErrAndExit(globalCatchException.message);
        }
    }

    public info(message: string, ...args: any[]): void {
        if (this.verbose || this._helpOverride()) {
            message = typeof message === "string" ? message : util.inspect(message);
            const info = color.yellowBright(`:info: ${util.format(message, ...args)}\n`);
            process.stdout.write(info);
        }
    }

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json];
    }

    protected getDefaultFormat(): Formater {
        return OUTPUT_FORMAT.json;
    }
    protected abstract do(
        flags: Record<string, any>,
        args?: Record<string, any>,
    ): Promise<CommandOutput> | Promise<NestedCommandOutput>;
    protected abstract getCommand(): typeof BaseCommand;
    protected abstract getCommandTechnicalName(): string;

    protected logAttribute(label: string, value: string) {
        this.log(`\t${label}: ${value}`);
    }

    protected fromSatoshi(value: number): number {
        return value / 100000000;
    }

    /**
     * Checks that all heights passed in parameter are equals
     * @param heights
     */
    protected checkDataConsistency(...heights: number[]) {
        if (!heights.every(v => v === heights[0])) {
            throw new Error("Data consistency error. Please retry.");
        }
    }

    protected actionStart(msg: string) {
        if (this.verbose) {
            cli.action.start(msg);
        }
    }

    protected actionStop() {
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
    protected async waitTransactionConfirmations(
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

    /**
     *
     * @param errorMsg Prompt error and exit command.
     */
    private promptErrAndExit(errorMsg: string): void {
        this.error(`[${this.getCommandTechnicalName()}] ${errorMsg}`);
        this.exit(1);
    }

    private disableLogs(): void {
        const disableFunction = (...args) => {
            /*doNothing*/
        };
        ["debug", "log", "info", "warn"].forEach(level => (console[level] = disableFunction));
        ["log", "warn", "info"].forEach(level => (this[level] = disableFunction));
        // Do not override console.error and this.error
    }
}
