import { DIDTypes, Wallet } from "@uns/ts-sdk";

export const commandName: string = "unik:disclose";

const unikId = "ad165bad9ae65009b0379e9f839d0c91e05f59f613f9ea2ef5f2b1ef2bbe81a1";

export const transaction = {
    id: "5c99940dad57352fabf9129bc24754780147c369a54b0128b866abd206a5f238",
    confirmations: 1413,
};

export const shouldExit = [
    {
        description: "Should exit with code 2 if no explicit value passed",
        args: [commandName, "--network", "sandbox", "--unikid", unikId],
        exitCode: 2,
    },
    {
        description: "Should exit with code 2 if no unikid value passed",
        args: [commandName, "--network", "sandbox", "-e", "unikname"],
        exitCode: 2,
    },
];

const IAT_CLIENT: number = 1570711986423;

export const WALLET_ADDRESS: string = "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA";
export const WALLET_PUB_KEY: string = "020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011";
export const WALLET_PASSPHRASE: string = "reveal front short spend enjoy label element text alert answer select bright";

export const TRANSACTION_ID: string = "1473aa7b0d95ccbe66da2a06bc4f279c671e15fb02b7b6a69038b749265f2986";

export const CHAINMETA = {
    height: "33",
    timestamp: {
        epoch: 79391124,
        unix: 1569488724,
        human: "2019-09-26T09:05:24.000Z",
    },
};

// @UNIK:captain-obvious:individual
export const UNIK_ID: string = "2bdd2a25f8abb77db342c41098da2fa00eccec34a182887dcae67503e7fd0d97";
export const UNIK = {
    id: UNIK_ID,
    ownerId: WALLET_ADDRESS,
    transactions: {
        first: {
            id: TRANSACTION_ID,
        },
        last: {
            id: TRANSACTION_ID,
        },
    },
};

export const WALLET: Wallet = {
    address: WALLET_ADDRESS,
    publicKey: WALLET_PUB_KEY,
    balance: 120,
    isDelegate: false,
};

const DISCLOSE_DEMAND_PAYLOAD = {
    explicitValue: ["captain-obvious", "captain0bvious"],
    type: DIDTypes.INDIVIDUAL,
    sub: UNIK_ID,
    iss: UNIK_ID,
    iat: IAT_CLIENT,
};

const DISCLOSE_DEMAND_SIGNATURE: string =
    "304402207b3575fbe997cc66b54450f63a4337e1143f7c0793957b75b113f55c8f9bbb30022021769b48de51a814e39e36dc63efbf3c9ca03acdc95b9adf0df45ae361538a2e";

export const DISCLOSE_DEMAND = {
    payload: DISCLOSE_DEMAND_PAYLOAD,
    signature: DISCLOSE_DEMAND_SIGNATURE,
};

const DISCLOSE_DEMAND_PAYLOAD_HASH: string = "8b9ac97fb5daf5546e92c87a1b8b852bc1b73dd3d0057d95e492bcbe7db364f8";
const SERVICE_PROVIDER_ID: string = "0035a40470021425558f5cbb7b5f056e51b694db5cc6c336abdc6b777fc9d051";
const IAT_SERVICE: number = 1570713987382;
const DISCLOSE_DEMAND_CERTIFICATION_PAYLOAD = {
    sub: DISCLOSE_DEMAND_PAYLOAD_HASH,
    iss: SERVICE_PROVIDER_ID,
    iat: IAT_SERVICE,
};

const DISCLOSE_DEMAND_CERTIFICATION_SIGNATURE: string =
    "3045022100e3a9ba47bc3eae7548f008fb1e58790663d7bfcee7a7a8f57e91f00e36189f4b02203c6bf68a37f915d23b93c9aa4836e00bac517dad8e24fb5b36477a55ce2f85a0";

export const DISCLOSE_DEMAND_CERTIFICATION = {
    payload: DISCLOSE_DEMAND_CERTIFICATION_PAYLOAD,
    signature: DISCLOSE_DEMAND_CERTIFICATION_SIGNATURE,
};

export const DISCLOSE_TRANSACTION_ID = "6ab2a7e06ac13f13490cc0e03b6a59e7c11e3063f1fe5e283d494240320e4ff4";

export const DISCLOSE_TRANSACTION = {
    id: DISCLOSE_TRANSACTION_ID,
    signature:
        "fbe12105d59022d8d4abc618d78e080b029083b801bd93b75955a6ea5ce966dc2888145f5fe856e0c3646e2732247107f7c5bd6014fd67ec7eb8a49597f5b7fa",
    version: 2,
    type: 0,
    fee: "100000000",
    senderPublicKey: WALLET_PUB_KEY,
    typeGroup: 2001,
    nonce: "1",
    asset: {
        "disclose-demand": DISCLOSE_DEMAND,
        "disclose-demand-certification": DISCLOSE_DEMAND_CERTIFICATION,
    },
    amount: "0",
};

export const DISCLOSE_OUTPUT = `{
  "data": {
    "transaction": "6ab2a7e06ac13f13490cc0e03b6a59e7c11e3063f1fe5e283d494240320e4ff4",
    "confirmations": 20
  }
}
`;
