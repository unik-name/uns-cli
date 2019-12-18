import { ChainMeta, Unik } from "@uns/ts-sdk";
import { BaseCommand } from "../../baseCommand";
import { Formater, NestedCommandOutput, OUTPUT_FORMAT } from "../../formater";
import { ReadCommand } from "../../readCommand";
import { checkUnikIdFormat, getChainContext, getNetworksListListForDescription, unikidFlag } from "../../utils";

export class UnikReadCommand extends ReadCommand {
    public static description = "Display UNIK token informations";

    public static examples = [
        `$ uns unik:read --unikid {unikId} --network ${getNetworksListListForDescription()} --format {json|yaml}`,
    ];

    public static flags = {
        ...ReadCommand.flags,
        ...unikidFlag("Token id to read"),
    };

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return UnikReadCommand;
    }

    protected async do(flags: Record<string, any>): Promise<NestedCommandOutput> {
        checkUnikIdFormat(flags.unikid);

        const unik: Unik & { chainmeta: ChainMeta } = await this.api.getUnikById(flags.unikid);
        const properties: {
            data: Array<{ [_: string]: string }>;
            chainmeta: ChainMeta;
        } = await this.api.getUnikProperties(flags.unikid);
        const creationTransaction = await this.api.getTransaction(unik.transactions.first.id);

        if (!creationTransaction) {
            throw new Error(`Error fetching transaction ${unik.transactions.first.id}`);
        }

        this.checkDataConsistency(
            unik.chainmeta.height,
            properties.chainmeta.height,
            creationTransaction.chainmeta.height,
        );

        const data = {
            id: unik.id,
            ownerAddress: unik.ownerId,
            creationBlock: creationTransaction.blockId,
            creationTransaction: creationTransaction.id,
            creationDate: creationTransaction.timestamp.human,
            properties: properties.data,
        };

        return {
            data,
            ...(flags.chainmeta
                ? getChainContext(unik.chainmeta, this.api.network.name, this.api.getCurrentNode())
                : {}),
        };
    }
}
