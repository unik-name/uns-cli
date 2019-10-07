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

export const transaction = {
    id: TRANSACTION_ID,
    signature:
        "3044022003af981da3c69208fb1b04cbe926f4a2a31586233db637503120f3cfbebc6e7a022042325f86067319a4417d0063d8d70d036fa60c67b0fde2c31e6254d0cef7b6a2",
    timestamp: TRANSACTION_TIMESTAMP,
    version: 1,
    type: 11,
    fee: 100000000,
    senderPublicKey: "020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011",
    amount: 0,
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

const verboseOutput = `» :info: node: https://forger1.devnet.uns.network;
unikid: ${UNIK_ID}
Transaction id: ${TRANSACTION_ID}
Transaction in explorer: https://explorer.devnet.uns.network/transaction/${TRANSACTION_ID}
UNIK nft forged:  20 confirmations
UNIK nft in UNS explorer: https://explorer.devnet.uns.network/uniks/${UNIK_ID}
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
            "devnet",
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
            "devnet",
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
            "devnet",
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
            "devnet",
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
    { description: "Should exit with code 2 if network flag is not passed", args: ["create-unik"], exitCode: 2 },
    {
        description: "Should exit with code 2 if network is not known",
        args: ["create-unik", "--network", "customNetwork"],
        exitCode: 2,
    },
    {
        description: "Should exit with code 2 if explicitValue is not passed",
        args: ["create-unik", "--network", "devnet", "--type", "individual"],
        exitCode: 2,
    },
    {
        description: "Should exit with code 2 if type is not passed",
        args: ["create-unik", "--network", "devnet", "--explicitValue", "bob"],
        exitCode: 2,
    },
    {
        description: "Should exit with code 2 if type is unknown",
        args: ["create-unik", "--network", "devnet", "--explicitValue", "bob", "--type", "unknownType"],
        exitCode: 2,
    },
];
