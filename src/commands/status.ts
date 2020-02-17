import { BlockchainState, INftStatus, NodeConfiguration, NodeStatus, ResponseWithChainMeta } from "@uns/ts-sdk";
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
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return StatusCommand;
    }

    protected async do(flags: Record<string, any>): Promise<CommandOutput> {
        const blockchainStatus: BlockchainState = await this.unsClientWrapper.getBlockchain();

        // Parallel requests + destructurating alltogether
        const [nftStatus, nodeStatus, nodeConf]: [
            ResponseWithChainMeta<INftStatus[]>,
            NodeStatus,
            NodeConfiguration,
        ] = await Promise.all([
            this.unsClientWrapper.unsClient.nft.status(),
            this.unsClientWrapper.getNodeStatus(),
            this.unsClientWrapper.getNodeConfiguration(),
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
            NFTs: nftStatus?.data,
            activeDelegates: nodeConf.constants.activeDelegates,
            lastBlockUrl: blockUrl,
        };

        if (flags.format === OUTPUT_FORMAT.table.key) {
            result = [result];
        }

        return result;
    }
}
