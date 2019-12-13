import { GetWalletAddressCommandHelper } from "../../../src/commandHelpers/cryptoaccount_address-helper";
import { CryptoAccountAddressCommand } from "../../../src/commands/cryptoaccount/address";
import { getUrlOrigin } from "../../../src/utils";
import {
    OUTPUT_CHAINMETA,
    shouldExit,
    WALLET_ADDRESS,
    WALLET_CHAINMETA,
    WALLET_PUBKEY,
} from "../../__fixtures__/commands/cryptoaccount/address";
import { applyExitCase, EMPTY_COMMAND_CONFIG, UNS_CLIENT_FOR_TESTS } from "../../__fixtures__/commons";

const currentNode = getUrlOrigin(UNS_CLIENT_FOR_TESTS.currentEndpointsConfig.chain.url);

describe("get-wallet-address command", () => {
    beforeEach(() => {
        process.env.DEV_MODE = "true";
    });

    describe("Exit cases", () => {
        shouldExit.forEach(exitCase => applyExitCase(exitCase));
    });

    describe("formatOutput", () => {
        it("format for json with chainmeta", () => {
            const output = new GetWalletAddressCommandHelper(
                new CryptoAccountAddressCommand([], EMPTY_COMMAND_CONFIG),
            ).formatOutput("json", WALLET_ADDRESS, WALLET_PUBKEY, WALLET_CHAINMETA, "dalinet", currentNode);
            expect(output).toEqual({
                data: {
                    address: WALLET_ADDRESS,
                    publicKey: WALLET_PUBKEY,
                },
                chainmeta: OUTPUT_CHAINMETA,
            });
        });

        it("format for json without chainmeta", () => {
            const output = new GetWalletAddressCommandHelper(
                new CryptoAccountAddressCommand([], EMPTY_COMMAND_CONFIG),
            ).formatOutput("json", WALLET_ADDRESS, WALLET_PUBKEY, undefined, "dalinet", currentNode);
            expect(output).toEqual({
                address: WALLET_ADDRESS,
                publicKey: WALLET_PUBKEY,
            });
        });

        it("format for yaml with chainmeta", () => {
            const output = new GetWalletAddressCommandHelper(
                new CryptoAccountAddressCommand([], EMPTY_COMMAND_CONFIG),
            ).formatOutput("yaml", WALLET_ADDRESS, WALLET_PUBKEY, WALLET_CHAINMETA, "dalinet", currentNode);
            expect(output).toEqual({
                data: {
                    address: WALLET_ADDRESS,
                    publicKey: WALLET_PUBKEY,
                },
                chainmeta: OUTPUT_CHAINMETA,
            });
        });

        it("format for yaml without chainmeta", () => {
            const output = new GetWalletAddressCommandHelper(
                new CryptoAccountAddressCommand([], EMPTY_COMMAND_CONFIG),
            ).formatOutput("yaml", WALLET_ADDRESS, WALLET_PUBKEY, undefined, "dalinet", currentNode);
            expect(output).toEqual({
                address: WALLET_ADDRESS,
                publicKey: WALLET_PUBKEY,
            });
        });

        it("format for raw", () => {
            const output = new GetWalletAddressCommandHelper(
                new CryptoAccountAddressCommand([], EMPTY_COMMAND_CONFIG),
            ).formatOutput("raw", WALLET_ADDRESS, WALLET_PUBKEY, WALLET_CHAINMETA, "dalinet", currentNode);
            expect(output).toEqual(WALLET_ADDRESS);
        });
    });
});
