import Config from "@oclif/config";
import { Interfaces, Managers, Utils } from "@uns/ark-crypto";
import {
    BlockchainState,
    ChainMeta,
    DIDHelpers,
    DIDType,
    FingerprintResult,
    getPropertyValue,
    IProcessorResult,
    Network,
    NodeConfiguration,
    NodeStatus,
    PropertyValue,
    Response,
    ResponseWithChainMeta,
    Token,
    Transaction,
    Unik,
    UnikVoucherResult,
    UNSClient,
    UNSEndpoint,
    Wallet,
    IDiscloseDemandCertification,
    IDiscloseDemand,
} from "@uns/ts-sdk";
import delay from "delay";
import { handleErrors, handleFetchError } from "./errorHandler";
import { WithChainmeta } from "./types";
import * as UTILS from "./utils";
import { getUrlOrigin } from "./utils";

export class UnsClientWrapper {
    public network: any;
    public unsClient: UNSClient;

    constructor(private commandConfig: Config.IConfig) {
        this.unsClient = new UNSClient();
    }

    public init(network: Network, customNodeUrl?: string, customServices?: string): UnsClientWrapper {
        this.unsClient.init({
            network,
            defaultHeaders: {
                "User-Agent": this.commandConfig.userAgent,
            },
        });

        if (customNodeUrl) this.unsClient.http.setCustomEndpoint(UNSEndpoint.network, customNodeUrl);
        if (customServices) this.unsClient.http.setCustomEndpoint(UNSEndpoint.services, customServices);

        const networkPreset = Managers.configManager.getPreset(network);
        this.network = {
            ...networkPreset.network,
            ...UTILS.getNetwork(this.unsClient.currentEndpointsConfig, customNodeUrl),
            ...this.getLastInfosFromMilestones(networkPreset.milestones),
        };
        return this;
    }

    /**
     * Broadcast transaction
     * @param transaction
     */
    public async sendTransaction(transaction: Interfaces.ITransactionData): Promise<any> {
        const transactionResult: IProcessorResult = await this.unsClient.transaction.send(transaction);

        if (transactionResult?.errors) {
            return {
                errors: `Transaction not accepted. Caused by: ${JSON.stringify(
                    handleErrors(transactionResult.errors),
                )}`,
            };
        }

        return transactionResult.data;
    }

    /**
     * Tries to get transaction after delay and returns it.
     * @param transactionId
     * @param msdelay
     */
    public async getTransaction(
        transactionId: string,
        msdelay: number = 0,
    ): Promise<WithChainmeta<Transaction> | undefined> {
        await delay(msdelay);
        try {
            const transactionResponse: ResponseWithChainMeta<Transaction> = await this.unsClient.transaction.get(
                transactionId,
            );
            return {
                ...(transactionResponse.data as Transaction),
                chainmeta: transactionResponse.chainmeta,
            };
        } catch (e) {
            if (e?.response?.status === 404) {
                return undefined;
            }
            throw new Error(`Error fetching transaction  ${transactionId}. Caused by: ${e.message}`);
        }
    }

    /**
     * Provides UNIK nft fingerprint from type and explicit value
     * @param explicitValue
     * @param type
     * @param nftName
     */
    public async computeTokenId(
        explicitValue: string,
        type: DIDType,
        nftName: string,
        addComputingInformationsToResponse: boolean = false,
    ): Promise<FingerprintResult> {
        try {
            const fingerPrintResponse: Response<FingerprintResult> = await this.unsClient.fingerprint.compute(
                explicitValue,
                DIDHelpers.fromLabel(type),
                nftName,
                addComputingInformationsToResponse,
            );
            if (fingerPrintResponse.error) {
                throw fingerPrintResponse.error;
            }

            if (!fingerPrintResponse.data || !fingerPrintResponse.data?.fingerprint) {
                throw new Error("Computed token id is invalid");
            }

            return fingerPrintResponse.data;
        } catch (e) {
            throw new Error(`Error computing  UNIK id. Caused by ${e.message}`);
        }
    }

    /**
     * Get Wallet by address.
     * @param unikid
     */
    public async getUnikById(unikid: string): Promise<WithChainmeta<Unik>> {
        try {
            const unikResponse: ResponseWithChainMeta<Unik> = await this.unsClient.unik.get(unikid);
            return {
                ...(unikResponse.data as Unik),
                chainmeta: unikResponse.chainmeta,
            };
        } catch (e) {
            return handleFetchError("UNIK", unikid)(e);
        }
    }

    /**
     *
     * @param unikid Get UNIK token properties
     */
    public async getUnikProperties(unikid: string): Promise<WithChainmeta<{ data: { [_: string]: PropertyValue }[] }>> {
        try {
            const propertiesResponse: ResponseWithChainMeta<
                {
                    [_: string]: PropertyValue;
                }[]
            > = await this.unsClient.unik.properties(unikid);
            return {
                data: propertiesResponse.data || [],
                chainmeta: propertiesResponse.chainmeta,
            };
        } catch (e) {
            return handleFetchError("UNIK properties", unikid)(e);
        }
    }

    public async getUnikProperty(
        unikid: string,
        propertyKey: string,
        withChainmeta: boolean = false,
    ): Promise<string | ResponseWithChainMeta<string>> {
        return getPropertyValue(unikid, propertyKey, this.unsClient, {
            withChainmeta,
            confirmations: true,
            disableHtmlEscape: true,
        });
    }

    /**
     * Get Wallet by address or public key. Find by public key should return 404 instead of find by address (if wallet really exists)
     * @param cryptoAccountAddress
     */
    public async getWallet(cryptoAccountAddress: string): Promise<WithChainmeta<Wallet>> {
        try {
            const walletResponse: ResponseWithChainMeta<Wallet> = await this.unsClient.wallet.get(cryptoAccountAddress);
            return {
                ...(walletResponse.data as Wallet),
                chainmeta: walletResponse.chainmeta,
            };
        } catch (e) {
            return handleFetchError("wallet", cryptoAccountAddress)(e);
        }
    }

    public async getWalletTokens(
        walletIdentifier: string,
        tokenName: string = "unik",
    ): Promise<{ data: Token[]; chainmeta: ChainMeta }> {
        try {
            const tokenResponse: ResponseWithChainMeta<Token[]> = await this.unsClient.wallet.tokens(
                walletIdentifier,
                tokenName,
            );
            return {
                data: tokenResponse.data as Token[],
                chainmeta: tokenResponse.chainmeta,
            };
        } catch (e) {
            return handleFetchError("wallet tokens", walletIdentifier)(e);
        }
    }

    /**
     * Get the current blockchain height
     */
    public async getCurrentHeight(): Promise<number> {
        try {
            const height: number | undefined = (await this.getBlockchain()).block?.height;

            if (!height) {
                throw new Error("Current height is undefined");
            }

            return height;
        } catch (e) {
            throw new Error(`Error fetching status.. Caused by ${e}`);
        }
    }

    public async getNodeConfiguration(): Promise<NodeConfiguration> {
        try {
            const nodeConfiguration: NodeConfiguration | undefined = (await this.unsClient.node.configuration()).data;
            if (!nodeConfiguration) {
                throw new Error("Node configuration not defined");
            }
            return nodeConfiguration;
        } catch (e) {
            throw new Error(`Error fetching node configuration... Caused by ${e}`);
        }
    }

    public async getConfigurationForCrypto(): Promise<Interfaces.INetworkConfig> {
        try {
            return (await this.unsClient.node.configurationCrypto()).data as Interfaces.INetworkConfig;
        } catch (e) {
            throw new Error(`Error fetching configuration for crypto.. Caused by ${e}`);
        }
    }

    public async getNonce(cryptoAccountAddress: string): Promise<string> {
        const COLD_WALLET_NONCE = "0";
        try {
            const data: any = await this.getWallet(cryptoAccountAddress);
            // TODO: add nonce to Wallet type
            return data.nonce ? Utils.BigNumber.make(data.nonce).toString() : COLD_WALLET_NONCE;
        } catch (ex) {
            return COLD_WALLET_NONCE;
        }
    }

    public async getBlockchain(): Promise<BlockchainState> {
        try {
            const blockchain: BlockchainState | undefined = (await this.unsClient.blockchain.get()).data;
            if (!blockchain) {
                throw new Error("Blockchain not defined");
            }
            return blockchain;
        } catch (e) {
            throw new Error(`Error fetching node configuration... Caused by ${e}`);
        }
    }

    /**
     * Get current node URL
     */
    public getCurrentNode() {
        return getUrlOrigin(this.network.url);
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
        return this.network.pubKeyHash;
    }

    public getExplorerUrl() {
        return this.network.client.explorer;
    }

    public async getNodeStatus(): Promise<NodeStatus> {
        const status: NodeStatus | undefined = (await this.unsClient.node.status()).data;
        if (!status) {
            throw new Error("Error fetching node status");
        }
        return status;
    }

    public async getDiscloseDemandCertification(discloseDemand: IDiscloseDemand) {
        const discloseDemandCertification: Response<IDiscloseDemandCertification> = await this.unsClient.discloseDemandCertification.create(
            discloseDemand,
        );

        if (discloseDemandCertification.error) {
            throw new Error(discloseDemandCertification.error.message);
        }

        if (!discloseDemandCertification.data) {
            throw new Error("Error creating disclose demand certification");
        }
        return discloseDemandCertification.data;
    }

    /**
     * Create Unik voucher
     * @param explicitValue
     * @param type
     * @param coupon
     * @param paymentProof
     */
    public async createUnikVoucher(
        explicitValue: string,
        type: DIDType,
        coupon?: string,
        paymentProof?: string,
    ): Promise<string> {
        const createVoucherResponse: Response<UnikVoucherResult> = await this.unsClient.vouchers.create({
            explicitValue,
            didType: DIDHelpers.fromLabel(type),
            coupon,
            paymentProof,
        });

        if (createVoucherResponse.error) {
            throw createVoucherResponse.error;
        }

        return createVoucherResponse.data?.unikVoucher as string;
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
