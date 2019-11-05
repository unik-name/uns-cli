import { ITransactionData } from "@uns/crypto";
import { getPropertyValue, PropertyValue, ResponseWithChainMeta } from "@uns/ts-sdk";
import delay from "delay";
import * as req from "request-promise";
import { FINGERPRINT_API } from "./config";
import { handleErrors, handleFetchError } from "./errorHandler";
import * as UTILS from "./utils";

export class UNSCLIAPI {
    public network: any;

    constructor(networkPreset) {
        this.network = {
            ...networkPreset.network,
            ...UTILS.getNetwork(networkPreset.network.name),
            ...this.getLastInfosFromMilestones(networkPreset.milestones),
        };
    }

    /**
     * Broadcast transaction
     * @param transaction
     */
    public async sendTransaction(transaction: ITransactionData): Promise<any> {
        const requestOptions = {
            body: {
                transactions: [transaction],
            },
            headers: {
                "api-version": 2,
                "Content-Type": "application/json",
            },
            json: true,
        };

        return req
            .post(`${this.network.url}/api/v2/transactions`, requestOptions)
            .then(resp => {
                if (resp.errors) {
                    resp.errors = `Transaction not accepted. Caused by: ${JSON.stringify(handleErrors(resp.errors))}`;
                }
                return resp;
            })
            .catch(e => {
                return { errors: `Technical error. ${e.message}` };
            });
    }

    /**
     * Tries to get transaction after delay and returns it.
     * @param transactionId
     * @param msdelay
     */
    public async getTransaction(transactionId: string, msdelay: number = 0): Promise<any> {
        await delay(msdelay);
        return req
            .get(`${this.network.url}/api/v2/transactions/${transactionId}`)
            .then(transactionResponse => {
                const transactionResp = JSON.parse(transactionResponse);
                return {
                    ...transactionResp.data,
                    chainmeta: transactionResp.chainmeta,
                };
            })
            .catch(e => {
                if (e.statusCode === 404) {
                    return undefined;
                }
                throw new Error(`Error fetching transaction  ${transactionId}. Caused by: ${e.message}`);
            });
    }

    /**
     * Provides UNIK nft fingerprint from type and explicit value
     * @param networkName
     * @param explicitValue
     * @param type
     */
    public async computeTokenId(backendUrl: string, explicitValue: string, type: string) {
        const fingerprintUrl = backendUrl + FINGERPRINT_API;
        const fingerPrintBody = {
            type,
            explicitValue,
        };

        const requestOptions = {
            body: fingerPrintBody,
            headers: {
                "Content-Type": "application/json",
                "api-version": 2,
            },
            json: true,
        };

        return req
            .post(fingerprintUrl, requestOptions)
            .then(unikFingerprintResponse => {
                return unikFingerprintResponse.data.fingerprint;
            })
            .catch(e => {
                throw new Error(`Error computing  UNIK id. Caused by ${e.message}`);
            });
    }

    /**
     * Get Wallet by address.
     * @param unikid
     */
    public async getUnikById(unikid: string) {
        return req
            .get(`${this.network.url}/api/v2/nfts/${unikid}`)
            .then(res => {
                const unikResponse = JSON.parse(res);
                return {
                    ...unikResponse.data,
                    chainmeta: unikResponse.chainmeta,
                };
            })
            .catch(handleFetchError("UNIK", unikid));
    }

    /**
     *
     * @param unikid Get UNIK token properties
     */
    public async getUnikProperties(unikid: string): Promise<any> {
        return req
            .get(`${this.network.url}/api/v2/nfts/${unikid}/properties`)
            .then(res => {
                return JSON.parse(res);
            })
            .catch(handleFetchError("UNIK properties", unikid));
    }

    public async getUnikProperty(
        unikid: string,
        propertyKey: string,
        withChainmeta: boolean,
    ): Promise<ResponseWithChainMeta<PropertyValue> | PropertyValue> {
        return getPropertyValue(unikid, propertyKey, this.network.name, {
            withChainmeta,
            confirmations: true,
            disableHtmlEscape: true,
        });
    }

    /**
     * Get count of UNIKs
     */
    public async getUniks() {
        return req
            .get(`${this.network.url}/api/v2/nfts`)
            .then(resp => {
                return JSON.parse(resp).meta.totalCount;
            })
            .catch(e => {
                throw new Error(`Error fetching UNIKs.. Caused by ${e}`);
            });
    }

    /**
     * Get Wallet by address or public key.
     * @param walletIdentifier
     */
    public async getWallet(walletIdentifier: string): Promise<any> {
        return req
            .get(`${this.network.url}/api/v2/wallets/${walletIdentifier}`)
            .then(res => {
                const walletResponse = JSON.parse(res);
                return {
                    ...walletResponse.data,
                    chainmeta: walletResponse.chainmeta,
                };
            })
            .catch(handleFetchError("wallet", walletIdentifier));
    }

    public async getWalletTokens(walletIdentifier: string, tokenName: string = "unik"): Promise<any> {
        return req
            .get(`${this.network.url}/api/v2/wallets/${walletIdentifier}/${tokenName}s`)
            .then(res => {
                const tokenResponse = JSON.parse(res);
                return {
                    data: tokenResponse.data,
                    chainmeta: tokenResponse.chainmeta,
                };
            })
            .catch(handleFetchError("wallet tokens", walletIdentifier));
    }

    /**
     * Get total (D)UNS supply.
     */
    public async getSupply() {
        return req
            .get(`${this.network.url}/api/blocks/getSupply`)
            .then(resp => {
                return JSON.parse(resp).supply;
            })
            .catch(e => {
                throw new Error(`Error fetching supply. Caused by ${e}`);
            });
    }

    /**
     * Get the current blockchain height
     */
    public async getCurrentHeight() {
        return req
            .get(`${this.network.url}/api/v2/node/status`)
            .then(resp => {
                return JSON.parse(resp).data.now;
            })
            .catch(e => {
                throw new Error(`Error fetching status.. Caused by ${e}`);
            });
    }

    /**
     * Get current node URL
     */
    public getCurrentNode() {
        return this.network.url;
    }

    /**
     * Get token name
     */
    public getToken() {
        return this.network.client.token;
    }

    /**
     * Get network active delegates
     */
    public getActiveDelegates() {
        return this.network.activeDelegates;
    }

    /**
     * Get network block time interval
     */
    public getBlockTime() {
        return this.network.blocktime;
    }

    /**
     * Get network node version
     */
    public getVersion() {
        return this.network.client.pubKeyHash;
    }

    public getExplorerUrl() {
        return this.network.client.explorer;
    }

    /**
     * Get last configuration from milestones
     * @param milestones
     */
    private getLastInfosFromMilestones(milestones: any[]): any {
        const infos: any = {};
        for (const { activeDelegates, blocktime } of milestones) {
            if (!infos.activeDelegates && activeDelegates) {
                infos.activeDelegates = activeDelegates;
            }
            if (!infos.blocktime && blocktime) {
                infos.blocktime = blocktime;
            }
            if (infos.activeDelegates && infos.blocktime) {
                break;
            }
        }
        return infos;
    }
}
