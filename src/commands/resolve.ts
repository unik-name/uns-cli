import { DidResolution } from "@uns/ts-sdk";
import flatten from "flat";
import { BaseCommand } from "../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../formater";
import { ReadCommand } from "../readCommand";
import { confirmedFlag, getChainContext, getNetworksListListForDescription } from "../utils";

export class ResolveCommand extends ReadCommand {
    public static description = "Resolve a decentralized identifier.";

    public static examples = [
        `$ uns resolve --confirmed {number of confirmations}
        --network ${getNetworksListListForDescription()} --format {json|yaml|table|raw} "@bob?phone"`,
    ];

    public static flags = {
        ...ReadCommand.flags,
        ...confirmedFlag,
    };

    public static args = [
        {
            name: "did",
            description: `The identifier to resolve. Expected format : "@[unik:][type,1:]expliciteValue[?propertyKey|?*]" (warning: DID must be surrounded with double quotes)`,
            required: true,
        },
    ];

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml, OUTPUT_FORMAT.raw];
    }

    protected getCommand(): typeof BaseCommand {
        return ResolveCommand;
    }

    protected async do(flags: Record<string, any>, args?: Record<string, any>): Promise<any> {
        const resolved: DidResolution<any> | undefined = await this.resolveUnikName(args?.did, flags);

        if (resolved) {
            if (resolved.error) {
                // DidParserError
                this.stop("DID does not match expected format");
            } else {
                if (resolved.confirmations && resolved.confirmations < flags.confirmed) {
                    this.warn("DID has not reach the requested confirmation level.");
                } else {
                    const resolvedResult: any = {
                        data: resolved.data,
                    };

                    if (flags.chainmeta && resolved.chainmeta) {
                        const metas = getChainContext(
                            resolved.chainmeta,
                            this.api.network.name,
                            this.api.getCurrentNode(),
                        );
                        resolvedResult.chainmeta = metas.chainmeta;
                    }

                    if (flags.format === OUTPUT_FORMAT.raw.key && resolvedResult.data instanceof Object) {
                        const flattenResult = flatten(resolvedResult.data);
                        this.log("", flattenResult);
                        return flattenResult;
                    }
                    return resolvedResult;
                }
            }
        }
        return "DID not resolved";
    }
}
