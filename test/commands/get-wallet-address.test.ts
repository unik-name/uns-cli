import { formatOutput } from "../../src/commands/get-wallet-address";
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
            const output = formatOutput(
                "json",
                true,
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
            const output = formatOutput(
                "json",
                false,
                WALLET_ADDRESS,
                WALLET_PUBKEY,
                WALLET_CHAINMETA,
                "devnet",
                NETWORKS.devnet.url,
            );
            expect(output).toEqual({
                address: WALLET_ADDRESS,
                publicKey: WALLET_PUBKEY,
            });
        });

        it("format for yaml with chainmeta", () => {
            const output = formatOutput(
                "yaml",
                true,
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
            const output = formatOutput(
                "yaml",
                false,
                WALLET_ADDRESS,
                WALLET_PUBKEY,
                WALLET_CHAINMETA,
                "devnet",
                NETWORKS.devnet.url,
            );
            expect(output).toEqual({
                address: WALLET_ADDRESS,
                publicKey: WALLET_PUBKEY,
            });
        });

        it("format for raw", () => {
            const output = formatOutput(
                "raw",
                true,
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
