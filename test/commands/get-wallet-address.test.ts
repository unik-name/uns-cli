import { GetWalletAddressCommandHelper } from "../../src/commandHelpers/get-wallet-address-helper";
import { GetWalletAddressCommand } from "../../src/commands/get-wallet-address";
import { NETWORKS } from "../../src/config";
import {
    OUTPUT_CHAINMETA,
    shouldExit,
    WALLET_ADDRESS,
    WALLET_CHAINMETA,
    WALLET_PUBKEY,
} from "../__fixtures__/commands/get-wallet-address";
import { applyExitCase } from "../__fixtures__/commons";

describe("get-property-value command", () => {
    describe("Exit cases", () => {
        shouldExit.forEach(exitCase => applyExitCase(exitCase));
    });

    describe("formatOutput", () => {
        it("format for json with chainmeta", () => {
            const output = new GetWalletAddressCommandHelper(new GetWalletAddressCommand([], undefined)).formatOutput(
                "json",
                WALLET_ADDRESS,
                WALLET_PUBKEY,
                WALLET_CHAINMETA,
                "devnet",
                NETWORKS.devnet.url,
            );
            expect(output).toEqual({
                data: {
                    address: WALLET_ADDRESS,
                    publicKey: WALLET_PUBKEY,
                },
                chainmeta: OUTPUT_CHAINMETA,
            });
        });

        it("format for json without chainmeta", () => {
            const output = new GetWalletAddressCommandHelper(new GetWalletAddressCommand([], undefined)).formatOutput(
                "json",
                WALLET_ADDRESS,
                WALLET_PUBKEY,
                undefined,
                "devnet",
                NETWORKS.devnet.url,
            );
            expect(output).toEqual({
                address: WALLET_ADDRESS,
                publicKey: WALLET_PUBKEY,
            });
        });

        it("format for yaml with chainmeta", () => {
            const output = new GetWalletAddressCommandHelper(new GetWalletAddressCommand([], undefined)).formatOutput(
                "yaml",
                WALLET_ADDRESS,
                WALLET_PUBKEY,
                WALLET_CHAINMETA,
                "devnet",
                NETWORKS.devnet.url,
            );
            expect(output).toEqual({
                data: {
                    address: WALLET_ADDRESS,
                    publicKey: WALLET_PUBKEY,
                },
                chainmeta: OUTPUT_CHAINMETA,
            });
        });

        it("format for yaml without chainmeta", () => {
            const output = new GetWalletAddressCommandHelper(new GetWalletAddressCommand([], undefined)).formatOutput(
                "yaml",
                WALLET_ADDRESS,
                WALLET_PUBKEY,
                undefined,
                "devnet",
                NETWORKS.devnet.url,
            );
            expect(output).toEqual({
                address: WALLET_ADDRESS,
                publicKey: WALLET_PUBKEY,
            });
        });

        it("format for raw", () => {
            const output = new GetWalletAddressCommandHelper(new GetWalletAddressCommand([], undefined)).formatOutput(
                "raw",
                WALLET_ADDRESS,
                WALLET_PUBKEY,
                WALLET_CHAINMETA,
                "devnet",
                NETWORKS.devnet.url,
            );
            expect(output).toEqual(WALLET_ADDRESS);
        });
    });
});
