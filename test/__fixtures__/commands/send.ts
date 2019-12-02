// WALLETS
// {
//   "address": "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA",
//   "publicKey": "020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011",
//   "privateKey": "f9cc1a42dc01b88c520998cfcdce4eefcf25e4cf612ec6a7228eea65d38f89d9",
//   "passphrase": "reveal front short spend enjoy label element text alert answer select bright",
//   "network": "devnet"
// }
export const SIMPLE_SIGN_TRANSACTION_ID: string = "393aeab4c96a8892ecd63e32bbc117f4404a2cb5f7cdfdc8c1757271eb614a2b";
export const SIMPLE_SIGN_WALLET_ID = "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA";
export const SIMPLE_SIGN_TRANSACTION_TIMESTAMP: number = 1234493;

// {
//   "address": "DUC657EFcecBi2ZnSr7N6AnQMmogce43r1",
//   "publicKey": "035f5e53b66dd42266568cb879f95383538ab31f43f22ba420f4fec83ee265aa4c",
//   "privateKey": "c6f6c0fb70ab01a457bacae2aeada2404220b9f654e5ccd8448a4fd30ad008ed",
//   "passphrase": "flag fall fog calm mean coach end leader ill gravity rely idea",
//   "secondPassphrase": "arch pitch badge quiz chef march panic deposit wolf attack biology dust",
//   "secondPublicKey": "03c9884ddcd0cbf08bb7bb0ba6ec4dafb17b21c29771032259abdb715c27677237",
//   "network": "devnet"
// }
export const SECOND_SIGN_TRANSACTION_ID: string = "393aeab4c96a8892ecd63e32bbc117f4404a2cb5f7cdfdc8c1757271eb614a2b";
export const SECOND_SIGN_WALLET_ID = "DUC657EFcecBi2ZnSr7N6AnQMmogce43r1";
export const SECOND_SIGN_TRANSACTION_TIMESTAMP: number = 1234493;

// TRANSACTIONS
export const SIMPLE_SIGN_TRANSCTION = {
    id: SIMPLE_SIGN_TRANSACTION_ID,
    signature:
        "3044022003af981da3c69208fb1b04cbe926f4a2a31586233db637503120f3cfbebc6e7a022042325f86067319a4417d0063d8d70d036fa60c67b0fde2c31e6254d0cef7b6a2",
    timestamp: SIMPLE_SIGN_TRANSACTION_TIMESTAMP,
    version: 1,
    type: 0,
    fee: 100000000,
    senderPublicKey: "020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011",
    recipientId: SECOND_SIGN_WALLET_ID,
    amount: 10,
};

export const SECOND_SIGN_TRANSCTION = {
    id: SECOND_SIGN_TRANSACTION_ID,
    signature:
        "3044022003af981da3c69208fb1b04cbe926f4a2a31586233db637503120f3cfbebc6e7a022042325f86067319a4417d0063d8d70d036fa60c67b0fde2c31e6254d0cef7b6a2",
    timestamp: SECOND_SIGN_TRANSACTION_TIMESTAMP,
    version: 1,
    type: 0,
    fee: 100000000,
    senderPublicKey: "035f5e53b66dd42266568cb879f95383538ab31f43f22ba420f4fec83ee265aa4c",
    recipientId: SIMPLE_SIGN_WALLET_ID,
    amount: 10,
};

// COMMON
export const meta = {
    height: "33",
    timestamp: {
        epoch: 79391124,
        unix: 1569488724,
        human: "2019-09-26T09:05:24.000Z",
    },
};

export const shouldExit = [
    {
        description: "Should exit with code 2 if amount is empty",
        args: ["send", "--network", "dalinet", "--to", "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA"],
        exitCode: 2,
        mocks: {
            nodeConfiguration: true,
            nodeConfigurationCrypto: true,
            status: false,
        },
    },
    {
        description: "Should exit with code 2 if to flag is empty",
        args: ["send", "--network", "dalinet", "10", "--to"],
        exitCode: 2,
        mocks: {
            nodeConfiguration: true,
            nodeConfigurationCrypto: true,
            status: false,
        },
    },
    {
        description: "Should exit with code 2 if to flag is absent",
        args: ["send", "--network", "dalinet", "10"],
        exitCode: 2,
        mocks: {
            nodeConfiguration: true,
            nodeConfigurationCrypto: true,
            status: true,
        },
    },
    {
        description: "Should exit with code 1 if amount is not a number",
        args: ["send", "--network", "dalinet", "abc", "--to", "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA"],
        exitCode: 1,
        mocks: {
            nodeConfiguration: true,
            nodeConfigurationCrypto: true,
            status: true,
        },
    },
    {
        description: "Should exit with code 1 if amount is not positive",
        args: ["send", "--network", "dalinet", "-10", "--to", "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA"],
        exitCode: 1,
        mocks: {
            nodeConfiguration: true,
            nodeConfigurationCrypto: true,
            status: true,
        },
    },
    {
        description: "Should exit with code 1 if amount has more than 8 digits after floating point",
        args: ["send", "--network", "dalinet", "10.123456789999", "--to", "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA"],
        exitCode: 1,
        mocks: {
            nodeConfiguration: true,
            nodeConfigurationCrypto: true,
            status: true,
        },
    },
    {
        description: "Should exit with code 1 if amount has more than one floating point",
        args: ["send", "--network", "dalinet", "10.000.00", "--to", "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA"],
        exitCode: 1,
        mocks: {
            nodeConfiguration: true,
            nodeConfigurationCrypto: true,
            status: true,
        },
    },
    {
        description: "Should exit with code 1 if amount contains thousands separator",
        args: ["send", "--network", "dalinet", "10,000.00", "--to", "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA"],
        exitCode: 1,
        mocks: {
            nodeConfiguration: true,
            nodeConfigurationCrypto: true,
            status: true,
        },
    },
    {
        description: "Should exit with code 1 recipient address is not a valid UNS address",
        args: ["send", "--network", "dalinet", "10", "--to", "DDwxZwjZQJUjeu7P"],
        exitCode: 1,
        mocks: {
            nodeConfiguration: true,
            nodeConfigurationCrypto: true,
            status: true,
        },
    },
    {
        description: "Should exit with code 1 recipient is not a valid @unik-name",
        args: ["send", "--network", "dalinet", "10", "--to", "@?*"],
        exitCode: 1,
        mocks: {
            nodeConfiguration: true,
            nodeConfigurationCrypto: true,
            status: true,
        },
    },
];
