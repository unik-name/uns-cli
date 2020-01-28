import { Wallet } from "@uns/ts-sdk";

// USED FOR TESTS
// {
//   "address": "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA",
//   "publicKey": "020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011",
//   "privateKey": "f9cc1a42dc01b88c520998cfcdce4eefcf25e4cf612ec6a7228eea65d38f89d9",
//   "passphrase": "reveal front short spend enjoy label element text alert answer select bright",
//   "network": "devnet"
// }

const commandName: string = "unik:create";

export const TRANSACTION_ID: string = "7ce8777a1ba0d5979cda8e53fa59d4d5e6b5d50464db90e0ae95b69381d6f6a0";
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
        "9ee1be3a76e97e4e8ae95a31148193557d69cf6d34e36cb7d16044b80289d7713aa41cd5995bd2a06f5d9dbb6e646c53655431b338748c0070b7b6306b23d28b",
    typeGroup: 2001,
    nonce: "2",
    version: 2,
    type: 3,
    fee: "100000000",
    senderPublicKey: "020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011",
    amount: "0",
    asset: {
        nft: {
            unik: {
                tokenId: UNIK_ID,
                properties: {
                    type: "1",
                },
            },
        },
        certification: {
            payload: {
                iss: "2b9799c35cbe4e8fb93c79c83aebe229f9f9909d7d13138ba837fca932dada76",
                sub: "6d8f88a373dbdb704dabdfd1ae4311a35484685ef3885c6e08bf7200648a9884",
                iat: 1579507453173,
            },
            signature:
                "3045022100fbff7614e5658b692484efccc4a1e2495e655c7fd95287a1ee857c42b789ca50022018d4f23db7b920a1465276cedb63aac3f923556e7bede080792c59638df16ee3",
        },
    },
};

export const wallet: Wallet = {
    address: "D59pZ7fH6vtk23mADnbpqyhfMiJzpdixws",
    publicKey: "020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011",
    balance: 999974660000000,
    isDelegate: false,
};

export const meta = {
    height: "33",
    timestamp: {
        epoch: 79391124,
        unix: 1569488724,
        human: "2019-09-26T09:05:24.000Z",
    },
};

const transactionStructInfo = `» :info: Broadcast transaction {
  id:
   '7ce8777a1ba0d5979cda8e53fa59d4d5e6b5d50464db90e0ae95b69381d6f6a0',
  signature:
   '9ee1be3a76e97e4e8ae95a31148193557d69cf6d34e36cb7d16044b80289d7713aa41cd5995bd2a06f5d9dbb6e646c53655431b338748c0070b7b6306b23d28b',
  secondSignature: undefined,
  version: 2,
  type: 3,
  fee: BigNumber { value: 100000000n },
  senderPublicKey: '020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011',
  network: undefined,
  typeGroup: 2001,
  nonce: BigNumber { value: 2n },
  recipientId: undefined,
  amount: BigNumber { value: 0n },
  asset: {
    nft: {
      unik: {
        tokenId: '6b8aca93a5181e736c35d88aeb4047e9d921f5e2b3e8fc7c5cf745e04894f24f',
        properties: { type: '1' }
      }
    },
    certification: {
      payload: {
        iss: '2b9799c35cbe4e8fb93c79c83aebe229f9f9909d7d13138ba837fca932dada76',
        sub: '6d8f88a373dbdb704dabdfd1ae4311a35484685ef3885c6e08bf7200648a9884',
        iat: 1579507453173
      },
      signature: '3045022100fbff7614e5658b692484efccc4a1e2495e655c7fd95287a1ee857c42b789ca50022018d4f23db7b920a1465276cedb63aac3f923556e7bede080792c59638df16ee3'
    }
  }
};`;

const verboseOutput = `» :info: DEV MODE IS ACTIVATED;
» :info: node: https://forger1.dalinet.uns.network;
unikid: ${UNIK_ID}
Transaction id: ${TRANSACTION_ID}
${transactionStructInfo}
Transaction in explorer: https://dalinet.explorer.uns.network/transaction/${TRANSACTION_ID}
UNIK nft forged:  20 confirmations
UNIK nft in UNS explorer: https://dalinet.explorer.uns.network/uniks/${UNIK_ID}
`;

const createUnikResultJson = `{
  "data": {
    "id": "6b8aca93a5181e736c35d88aeb4047e9d921f5e2b3e8fc7c5cf745e04894f24f",
    "transaction": "7ce8777a1ba0d5979cda8e53fa59d4d5e6b5d50464db90e0ae95b69381d6f6a0",
    "confirmations": 20
  }
}
`;

const createUnikResultYaml = `data:
  id: 6b8aca93a5181e736c35d88aeb4047e9d921f5e2b3e8fc7c5cf745e04894f24f
  transaction: 7ce8777a1ba0d5979cda8e53fa59d4d5e6b5d50464db90e0ae95b69381d6f6a0
  confirmations: 20
`;

export const outputCases = [
    {
        description: "Should create unik token bob of type individual",
        args: [
            commandName,
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
            commandName,
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
            commandName,
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
            commandName,
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
        args: [commandName, "--network", "dalinet", "--type", "individual"],
        exitCode: 2,
    },
    {
        description: "Should exit with code 2 if type is not passed",
        args: [commandName, "--network", "dalinet", "--explicitValue", "bob"],
        exitCode: 2,
    },
    {
        description: "Should exit with code 2 if type is unknown",
        args: [commandName, "--network", "dalinet", "--explicitValue", "bob", "--type", "unknownType"],
        exitCode: 2,
    },
];

export const MINT_CERTIFICATION_DEMAND = {
    nft: {
        unik: {
            tokenId: "6b8aca93a5181e736c35d88aeb4047e9d921f5e2b3e8fc7c5cf745e04894f24f",
            properties: {
                type: "1",
            },
        },
    },
};

export const MINT_CERTIFICATION = {
    data: {
        payload: {
            iss: "2b9799c35cbe4e8fb93c79c83aebe229f9f9909d7d13138ba837fca932dada76",
            sub: "6d8f88a373dbdb704dabdfd1ae4311a35484685ef3885c6e08bf7200648a9884",
            iat: 1579507453173,
        },
        signature:
            "3045022100fbff7614e5658b692484efccc4a1e2495e655c7fd95287a1ee857c42b789ca50022018d4f23db7b920a1465276cedb63aac3f923556e7bede080792c59638df16ee3",
    },
};
