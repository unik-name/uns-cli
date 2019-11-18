import { Networks } from "@uns/ark-crypto";
import { getNetworkNameByNetHash } from "../../../src/utils/command-utils";

describe("command-utils", () => {
    describe("getNetworkNameByNetHash", () => {
        it("should throw error with unknown nethash", () => {
            const UNKNOWN_NETHASH = "sfdsfdsfdsfdslkjdslvjuxclnvxc,nvxc;jhn";
            try {
                getNetworkNameByNetHash(UNKNOWN_NETHASH);
                expect(true).toBeFalsy();
            } catch (e) {
                expect(e.message).toEqual(`No network found with nethash '${UNKNOWN_NETHASH}'`);
            }
        });

        it("should succeed and return devnet", () => {
            const network: string = getNetworkNameByNetHash(Networks.devnet.network.nethash);
            expect(network).toEqual("devnet");
        });
    });
});
