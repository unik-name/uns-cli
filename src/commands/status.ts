import { BlockchainState, NodeConfiguration, NodeStatus, Response } from "@uns/ts-sdk";
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

        // Parallel requests + destructurating alltogether
        const [numberOfUniks, { data: nodeStatus }, { data: nodeConf }]: [
            number,
            Response<NodeStatus>,
            Response<NodeConfiguration>,
        ] = await Promise.all([
            this.unsClient.unik.totalCount(),
            this.unsClient.node.status(),
            this.unsClient.node.configuration(),
        ]);

        if (!nodeConf || !blockchainStatus || !nodeStatus) {
            throw new Error(`Error fetching blockchain configuration ${nodeConf}, ${blockchainStatus}, ${nodeStatus}`);
        }

        const height: number = nodeStatus.now;
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
