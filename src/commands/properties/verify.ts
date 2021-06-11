import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { getTargetArg } from "../../utils";
import { flags as oFlags } from "@oclif/command";
import { NftFactoryServicesList, VERIFIED_URL_KEY_PREFIX, JWTVerifier } from "@uns/ts-sdk";
import { readFileSync } from "fs";
import { PropertiesUpdateCommand } from "../../updatePropertiesCommand";
import { PropertyRegisterCommand } from "./register";
import { cli } from "cli-ux";

export class PropertyVerifyCommand extends PropertiesUpdateCommand {
    public static description = "Conclude ownership verification processus.";

    public static usage = "properties:verify TARGET --type {url} --url-channel {html,file} --url-name {label}";

    public static examples = ["$ uns properties:verify @bob --url-channel html "];

    public static flags = {
        ...PropertiesUpdateCommand.getUpdateCommandFlags(),
        type: oFlags.string({
            char: "t",
            description: "Type of unik property to verify",
            options: PropertyVerifyCommand.getAvailablePropertyTypes(),
            required: true,
            default: "url",
        }),
        ["url-channel"]: oFlags.string({
            char: "c",
            description: "method used for verification",
            options: PropertyVerifyCommand.getAllowedUrlChannels(),
            required: true,
        }),
        ["url-name"]: oFlags.string({
            description: "Property label. Used as property key of UNIK property.",
            required: true,
            default: "0",
        }),
        value: oFlags.string({
            char: "V",
            description: "Value of the Unik property to verify. To use with whitelist verification mode",
            hidden: true,
        }),
    };

    public static args = [getTargetArg()];

    public static getAvailablePropertyTypes(): string[] {
        return ["url"];
    }

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return PropertyVerifyCommand;
    }

    public static getAllowedUrlChannels(): string[] {
        return ["html", "file", "whitelist"];
    }

    protected async getServiceId(flags: Record<string, any>): Promise<NftFactoryServicesList | undefined> {
        switch (flags["url-channel"]) {
            case "html":
                return NftFactoryServicesList.URL_CHECKER_TXT;
            case "file":
                return NftFactoryServicesList.URL_CHECKER_FILE_UPLOAD;
            case "whitelist":
                return NftFactoryServicesList.NFT_FACTORY_URL_VERIFICATION;
        }
        return;
    }

    protected async getProperties(flags: Record<string, any>, unikId: string): Promise<{ [_: string]: string }> {
        const properties: { [_: string]: string } = {};
        const verifiedPropertyKey = `${VERIFIED_URL_KEY_PREFIX}${flags["url-name"]}`;

        try {
            // Should throw if key does not exists
            await this.unsClientWrapper.getUnikProperty(unikId, verifiedPropertyKey, false);

            const canContinue = await cli.confirm(
                `This verified url name is already used (${verifiedPropertyKey}). You can change it using the --url-name option
See properties in the explorer: https://explorer.uns.network/uniks/${unikId}
Are you sure you want to override this verified URL?`,
            );

            if (!canContinue) {
                this.exit(0); // Normal exit
            }
        } catch (error) {
            if (error.response.status !== 404) {
                throw error;
            }
        }

        if (flags["url-channel"] === "whitelist") {
            if (!flags.value) {
                throw new Error(`For whitelist mode please set the --value flag`);
            }
            properties[verifiedPropertyKey] = flags.value;
            return properties;
        }

        let rawJwt: string;
        try {
            rawJwt = readFileSync(PropertyRegisterCommand.JWT_FILENAME).toString();
        } catch (e) {
            throw new Error(
                `Unable to read verifier token \"${PropertyRegisterCommand.JWT_FILENAME}\". You can generate it from properties:register command`,
            );
        }
        const providerUNID = this.getServiceProviderUNID(flags);
        const jwtToken = await new JWTVerifier(this.unsClientWrapper.unsClient).verifyUnsJWT(rawJwt, providerUNID);

        const proof = JSON.stringify({
            iat: jwtToken.payload.iat,
            exp: jwtToken.payload.exp,
            jti: jwtToken.payload.jti,
            sig: rawJwt.split(".")[2],
        });
        properties[verifiedPropertyKey] = `https://${jwtToken.payload.value}`;
        properties[`${verifiedPropertyKey}/proof`] = proof;

        return properties;
    }
}
