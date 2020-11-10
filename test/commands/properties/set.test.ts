import { expect, test } from "@oclif/test";
import { Transactions, Utils } from "@uns/ark-crypto";
import { CertifiedNftUpdateTransaction } from "@uns/crypto";
import * as SDK from "@uns/ts-sdk";
import { UNIK_RESULT } from "../../__fixtures__/commands/properties/get";
import { BLOCKCHAIN, NODE_CONFIGURATION_CRYPTO, UNS_CLIENT_FOR_TESTS } from "../../__fixtures__/commons";

const UNIK_ID = "51615becbd39ad96344919dffa7b972f293b0a3973b05145fd6d0a1a20cac169";
const PASSPHRASE = "reveal front short spend enjoy label element text alert answer select bright";
const TRANSACTION_ID: string = "7ce8777a1ba0d5979cda8e53fa59d4d5e6b5d50464db90e0ae95b69381d6f6a0";

const commandName: string = "properties:set";

const walletAddress = "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA";
describe(`${commandName} command`, () => {
    beforeEach(() => {
        process.env.DEV_MODE = "true";
        Transactions.TransactionRegistry.registerTransactionType(CertifiedNftUpdateTransaction);
    });

    describe("Schema validation", () => {
        const tooLongValue =
            "toolong1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";

        jest.spyOn(SDK, "createCertifiedNftUpdateTransaction").mockImplementation(() => {
            return new Promise((resolve, _) => {
                return resolve({
                    id: TRANSACTION_ID,
                    signature:
                        "9ee1be3a76e97e4e8ae95a31148193557d69cf6d34e36cb7d16044b80289d7713aa41cd5995bd2a06f5d9dbb6e646c53655431b338748c0070b7b6306b23d28b",
                    typeGroup: 2001,
                    nonce: new Utils.BigNumber(2),
                    version: 2,
                    type: 4,
                    fee: new Utils.BigNumber(100000000),
                    senderPublicKey: "020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011",
                    amount: Utils.BigNumber.ZERO,
                    timestamp: 12,
                    asset: {
                        nft: {
                            unik: {
                                tokenId: UNIK_ID,
                                properties: {
                                    type: "1",
                                    "usr/tooLong": tooLongValue,
                                },
                            },
                        },
                        demand: {
                            payload: {
                                iss: UNIK_ID,
                                sub: UNIK_ID,
                                iat: 1579507453173,
                                cryptoAccountAddress: walletAddress,
                            },
                            signature:
                                "3045022100fbff7614e5658b692484efccc4a1e2495e655c7fd95287a1ee857c42b789ca50022018d4f23db7b920a1465276cedb63aac3f923556e7bede080792c59638df16ee4",
                        },
                        certification: {
                            payload: {
                                iss: "2b9799c35cbe4e8fb93c79c83aebe229f9f9909d7d13138ba837fca932dada76",
                                sub: "6d8f88a373dbdb704dabdfd1ae4311a35484685ef3885c6e08bf7200648a9884",
                                iat: 1579507453173,
                                cost: Utils.BigNumber.ZERO,
                            },
                            signature:
                                "3045022100fbff7614e5658b692484efccc4a1e2495e655c7fd95287a1ee857c42b789ca50022018d4f23db7b920a1465276cedb63aac3f923556e7bede080792c59638df16ee3",
                        },
                    },
                });
            });
        });

        test.stderr()
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.network, (api) =>
                api.get(`/uniks/${UNIK_ID}`).reply(200, UNIK_RESULT),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.network, (api) => {
                api.get(`/wallets/${walletAddress}`).reply(200, {
                    data: {
                        nonce: "1",
                    },
                });
            })
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.network, (api) =>
                api.get(`/node/configuration/crypto`).reply(200, NODE_CONFIGURATION_CRYPTO),
            )
            .nock(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.network, (api) =>
                api.get(`/blockchain`).reply(200, BLOCKCHAIN),
            )
            .command([
                commandName,
                UNIK_ID,
                "-n",
                "dalinet",
                "--passphrase",
                PASSPHRASE,
                "--key",
                "usr/tooLong",
                "--value",
                tooLongValue,
            ])
            // tslint:disable-next-line:no-empty
            .catch((_) => {})
            .it("Should throw too long property", (ctx) => {
                expect(ctx.stderr).to.equal(
                    "» :stop: data.asset.nft['unik'].properties['usr/tooLong'] should NOT be longer than 255 characters;\n",
                );
            });
    });
});
