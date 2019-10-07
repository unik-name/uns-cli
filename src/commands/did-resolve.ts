import { DidParserError, didResolve, ResourceWithChainMeta, UnikToken } from "@uns/ts-sdk";
import flatten from "flat";
import { BaseCommand } from "../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../formater";
import { confirmedFlag, getNetworksListListForDescription } from "../utils";

export class DidResolveCommand extends BaseCommand {
    public static description = "Resolve a decentralized identifier.";

    public static examples = [
        `$ uns did-resolve --confirmed {number of confirmations}
        --network ${getNetworksListListForDescription()} --format {json|yaml|table|raw}`,
    ];

    public static flags = {
        ...BaseCommand.baseFlags,
        ...confirmedFlag,
    };

    public static args = [
        {
            name: "did",
            description:
                "The identifier to resolve. Expected format : '@[unik:][type,1]/expliciteValue[?propertyKey|?*]'",
        },
    ];

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml, OUTPUT_FORMAT.raw];
    }

    protected getDefaultFormat(): Formater {
        return OUTPUT_FORMAT.raw;
    }

    protected getCommand(): typeof BaseCommand {
        return DidResolveCommand;
    }

    protected async do(flags: Record<string, any>, args?: Record<string, any>): Promise<any> {
        const didResolveNetwork = flags.network === "local" ? "TESTNET" : flags.network;

        let resolved: ResourceWithChainMeta<UnikToken | string | number> | DidParserError;
        try {
            resolved = await didResolve(args.did, didResolveNetwork);
        } catch (error) {
            if (error.response.status === 404) {
                this.stop("DID does not exist");
            } else {
                this.stop("An error occurred. Please see details below:\n", error);
            }
        }

        if (resolved) {
            if (resolved instanceof Error) {
                // DidParserError
                this.stop("DID does not match expected format");
            } else {
                if (resolved.confirmations && resolved.confirmations < flags.confirmed) {
                    this.warn("DID has not reach the requested confirmation level.");
                } else {
                    delete resolved.chainmeta;
                    delete resolved.confirmations;

                    if (flags.format === OUTPUT_FORMAT.raw.key && resolved.data instanceof Object) {
                        const flattenResult = flatten(resolved.data);
                        this.log("", flattenResult);
                        return flattenResult;
                    }
                    return resolved;
                }
            }
        }
        return "DID not resolved";
    }
}
