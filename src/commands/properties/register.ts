import { BaseCommand } from "../../baseCommand";
import { Formater, OUTPUT_FORMAT } from "../../formater";
import { getTargetArg, passphraseFlag } from "../../utils";
import { flags } from "@oclif/command";
import { CryptoAccountPassphrases } from "types";
import { JwtUtils, PropertyVerifierType } from "@uns/ts-sdk";
import { writeFileSync } from "fs";

export class PropertyRegisterCommand extends BaseCommand {
    public static description = "Initiate ownership verification processus.";

    public static usage = "properties:register TARGET --value {propertyValue}";

    public static examples = ['$ uns properties:register @bob --value  "www.mydomain.com"'];

    public static getFlags() {
        const cmdFlags: any = {
            ...BaseCommand.baseFlags,
            ...passphraseFlag,
            type: flags.string({
                char: "t",
                description: "type of unik property to register",
                options: PropertyRegisterCommand.getAvailablePropertyTypes(),
                default: "url",
                required: true,
            }),
            value: flags.string({
                char: "V",
                description: "Value of the Unik property to verify",
                required: true,
            }),
        };
        delete cmdFlags.node;
        return cmdFlags;
    }
    public static flags = PropertyRegisterCommand.getFlags();

    public static args = [getTargetArg()];

    public static getAvailablePropertyTypes(): string[] {
        return ["url"];
    }

    protected getAvailableFormats(): Formater[] {
        return [OUTPUT_FORMAT.json, OUTPUT_FORMAT.yaml];
    }

    protected getCommand(): typeof BaseCommand {
        return PropertyRegisterCommand;
    }

    protected getServiceProviderUNID(): string {
        // returns the UNID of UNS forge factory
        // will be configurable in case of multiple service providers available on UNS network
        return this.unsClientWrapper.network.forgeFactory.unikidWhiteList[0];
    }

    public static JWT_FILENAME = "uns-verification.txt";
    private DEFAULT_EXPIRATION_TIME = 259200; // 72h

    protected async do(flags: Record<string, any>, args: Record<string, any>): Promise<any> {
        const { unikid } = await this.targetResolve(flags, args.target);

        const passphrases: CryptoAccountPassphrases = await this.askForPassphrases(flags, false);

        const value = flags.value.trim();
        const providerUNID = this.getServiceProviderUNID();

        const rawJwt: string = await JwtUtils.createPropertyVerifierToken(
            unikid,
            providerUNID,
            passphrases.first,
            this.DEFAULT_EXPIRATION_TIME,
            flags.type as PropertyVerifierType,
            value,
        );

        const jwtToken = await new JwtUtils.JWTVerifier(this.unsClientWrapper.unsClient).verifyUnsJWT(
            rawJwt,
            providerUNID,
        );

        try {
            writeFileSync(PropertyRegisterCommand.JWT_FILENAME, rawJwt);
        } catch (err) {
            throw new Error(`Unable to write verifier token \"${PropertyRegisterCommand.JWT_FILENAME}\": ${err}`);
        }
        this.info(`Verification package has been saved into ${PropertyRegisterCommand.JWT_FILENAME}`);

        return {
            data: {
                unik: args.target,
                action: "uns:urlchecker-verification",
                value,
                filepath: `${process.cwd()}/${PropertyRegisterCommand.JWT_FILENAME}`,
                verificationKey: jwtToken.payload.jti,
                expirationDate: new Date(jwtToken.payload.exp * 1000).toISOString(),
            },
        };
    }
}
