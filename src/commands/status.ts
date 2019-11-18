import { BlockchainState, NodeConfiguration, NodeStatus } from "@uns/ts-sdk";
import { BaseCommand } from "../baseCommand";
import { CommandOutput, Formater, OUTPUT_FORMAT } from "../formater";
import { fromSatoshi, getNetworkNameByNetHash, getNetworksListListForDescription } from "../utils";

export class StatusCommand extends BaseCommand {
    public static description = "Display blockchain status";

    public static examples = [`$ uns status --network ${getNetworksListListForDescription()}`];

    public static flags = {
        ...BaseCommand.baseFlags,
    };

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml, OUTPUT_FORMAT.table];
    }

    protected getCommand(): typeof BaseCommand {
        return StatusCommand;
    }

    protected async do(flags: Record<string, any>): Promise<CommandOutput> {
        const blockchainStatus: BlockchainState | undefined = (await this.unsClient.blockchain.get()).data;

        if (!blockchainStatus) {
            throw new Error("Error fetching blockchain current state");
        }

        const numberOfUniks: number = await this.unsClient.unik.totalCount();

        const nodeStatus: NodeStatus | undefined = (await this.unsClient.node.status()).data;

        if (!nodeStatus) {
            throw new Error("Error fetching blockchain node status");
        }

        const height: number = nodeStatus.now;

        const nodeConf: NodeConfiguration | undefined = (await this.unsClient.node.configuration()).data;

        if (!nodeConf) {
            throw new Error("Error fetching blockchain node configuration");
        }

        const blockUrl = `${nodeConf.explorer}/block/${height}`;

        const networkName = getNetworkNameByNetHash(nodeConf.nethash);

        if (flags.node && networkName !== flags.network) {
            this.warn(`The node URL you've provided '${flags.node}' doesn't correspond to '${flags.network}' network`);
        }

        let result: any = {
            height,
            network: networkName,
            totalTokenSupply: fromSatoshi(blockchainStatus.supply),
            tokenSymbol: nodeConf.symbol,
            numberOfUniks,
            activeDelegates: nodeConf.constants.activeDelegates,
            lastBlockUrl: blockUrl,
        };

        if (flags.format === OUTPUT_FORMAT.table.key) {
            result = [result];
        }

        return result;
    }
}
