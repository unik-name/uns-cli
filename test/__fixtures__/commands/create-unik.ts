import { Wallet } from "@uns/ts-sdk";

// USED FOR TESTS
// {
//   "address": "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA",
//   "publicKey": "020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011",
//   "privateKey": "f9cc1a42dc01b88c520998cfcdce4eefcf25e4cf612ec6a7228eea65d38f89d9",
//   "passphrase": "reveal front short spend enjoy label element text alert answer select bright",
//   "network": "devnet"
// }

export const TRANSACTION_ID: string = "393aeab4c96a8892ecd63e32bbc117f4404a2cb5f7cdfdc8c1757271eb614a2b";
export const TRANSACTION_TIMESTAMP: number = 1234493;
export const UNIK_ID = "6b8aca93a5181e736c35d88aeb4047e9d921f5e2b3e8fc7c5cf745e04894f24f";
export const WALLET_ID: string = "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA";

export const WALLET: Wallet = {
    address: WALLET_ID,
    publicKey: "020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011",
    balance: 999974660000000,
    isDelegate: false,
};

export const WALLET_CHAINMETA = {
    height: "415890",
    timestamp: {
        epoch: 3453333,
        unix: 1572346663,
        human: "2019-10-29T10:57:43.000Z",
    },
};

export const transaction = {
    id: TRANSACTION_ID,
    signature:
        "ce47173bae3c6edb1db991013ec29498bc35e4fb5df7470aee13ce8c43ad537dd00458eeedecee9e7974bb76133a53797dfeed752a82c336a464719605b41a67",
    typeGroup: 2000,
    nonce: "2",
    version: 2,
    type: 0,
    fee: "100000000",
    senderPublicKey: "020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011",
    amount: "0",
    asset: {
        nft: {
            unik: {
                tokenId: UNIK_ID,
                properties: { type: "1" },
            },
        },
    },
};

export const meta = {
    height: "33",
    timestamp: {
        epoch: 79391124,
        unix: 1569488724,
        human: "2019-09-26T09:05:24.000Z",
    },
};

const verboseOutput = `» :info: DEV MODE IS ACTIVATED;
» :info: node: https://forger1.dalinet.uns.network;
unikid: ${UNIK_ID}
Transaction id: ${TRANSACTION_ID}
Transaction in explorer: https://dalinet.explorer.uns.network/transaction/${TRANSACTION_ID}
UNIK nft forged:  20 confirmations
UNIK nft in UNS explorer: https://dalinet.explorer.uns.network/uniks/${UNIK_ID}
`;

const createUnikResultJson = `{
  "data": {
    "id": "6b8aca93a5181e736c35d88aeb4047e9d921f5e2b3e8fc7c5cf745e04894f24f",
    "transaction": "393aeab4c96a8892ecd63e32bbc117f4404a2cb5f7cdfdc8c1757271eb614a2b",
    "confirmations": 20
  }
}
`;

const createUnikResultYaml = `data:
  id: 6b8aca93a5181e736c35d88aeb4047e9d921f5e2b3e8fc7c5cf745e04894f24f
  transaction: 393aeab4c96a8892ecd63e32bbc117f4404a2cb5f7cdfdc8c1757271eb614a2b
  confirmations: 20
`;

export const outputCases = [
    {
        description: "Should create unik token bob of type individual",
        args: [
            "create-unik",
            "--network",
            "dalinet",
            "--explicitValue",
            "bob",
            "--type",
            "individual",
            "--passphrase",
            "reveal front short spend enjoy label element text alert answer select bright",
        ],
        expected: createUnikResultJson,
    },
    {
        description: "Should create unik token bob of type individual with verbose",
        args: [
            "create-unik",
            "--network",
            "dalinet",
            "--explicitValue",
            "bob",
            "--type",
            "individual",
            "--passphrase",
            "reveal front short spend enjoy label element text alert answer select bright",
            "--verbose",
        ],
        expected: verboseOutput + createUnikResultJson,
    },
    {
        description: "Should create unik token bob of type individual yaml format",
        args: [
            "create-unik",
            "--network",
            "dalinet",
            "--explicitValue",
            "bob",
            "--type",
            "individual",
            "--passphrase",
            "reveal front short spend enjoy label element text alert answer select bright",
            "--format",
            "yaml",
        ],
        expected: createUnikResultYaml,
    },
    {
        description: "Should create unik token bob of type individual yaml format with verbose",
        args: [
            "create-unik",
            "--network",
            "dalinet",
            "--explicitValue",
            "bob",
            "--type",
            "individual",
            "--passphrase",
            "reveal front short spend enjoy label element text alert answer select bright",
            "--verbose",
            "--format",
            "yaml",
        ],
        expected: verboseOutput + createUnikResultYaml,
    },
];

export const shouldExit = [
    {
        description: "Should exit with code 2 if explicitValue is not passed",
        args: ["create-unik", "--network", "dalinet", "--type", "individual"],
        exitCode: 2,
    },
    {
        description: "Should exit with code 2 if type is not passed",
        args: ["create-unik", "--network", "dalinet", "--explicitValue", "bob"],
        exitCode: 2,
    },
    {
        description: "Should exit with code 2 if type is unknown",
        args: ["create-unik", "--network", "dalinet", "--explicitValue", "bob", "--type", "unknownType"],
        exitCode: 2,
    },
];
