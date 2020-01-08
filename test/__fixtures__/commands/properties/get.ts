import { getMeta } from "../../commons";

const commandName: string = "properties:get";

export const UNIK_ID = "51615becbd39ad96344919dffa7b972f293b0a3973b05145fd6d0a1a20cac169";
const WALLET_ADDRESS: string = "DQLiVPs2b6rHYCANjVk7vWVfQqdo5rLvDU";
export const TRANSACTION_ID: string = "1473aa7b0d95ccbe66da2a06bc4f279c671e15fb02b7b6a69038b749265f2986";

export const UNIK_RESULT = {
    data: {
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
    },
    chainmeta: getMeta(33),
    confirmations: 20,
};

export const TRANSACTION_RESULT = {
    data: {
        id: TRANSACTION_ID,
        confirmations: 20,
    },
    chainmeta: getMeta(33),
};

export const PROPERTY_RESULT = {
    data: "1",
    chainmeta: getMeta(33),
};

export const PROPERTY_RESULT_FOR_CONSISTENCY_FAIL = {
    data: "1",
    chainmeta: getMeta(32),
};

export const EXPECTED_PROPERTY_OUTPUT = `{
  "data": {
    "unikid": "51615becbd39ad96344919dffa7b972f293b0a3973b05145fd6d0a1a20cac169",
    "property": "type",
    "value": "1",
    "confirmations": 20
  }
}
`;

export const EXPECTED_PROPERTY_WITH_CHAINMETA_OUTPUT = `{
  "data": {
    "unikid": "51615becbd39ad96344919dffa7b972f293b0a3973b05145fd6d0a1a20cac169",
    "property": "type",
    "value": "1",
    "confirmations": 20
  },
  "chainmeta": {
    "network": "dalinet",
    "node": "https://forger1.dalinet.uns.network",
    "date": "2019-09-26T09:05:24.000Z",
    "height": "33"
  }
}
`;

export const shouldExit = [
    {
        description: "Should exit with code 2 if output format is not allowed for that command",
        args: [commandName, "-n", "dalinet", "--unikid", UNIK_ID, "-k", "property", "-f", "table", "--verbose"],
        exitCode: 2,
    },
    {
        description: "Should exit with code 1 if unikid doesn't match",
        args: [commandName, "-n", "dalinet", "--unikid", "123", "-k", "type"],
        exitCode: 1,
        mocks: {
            nodeConfigurationCrypto: true,
            blockchain: true,
        },
    },
    {
        description: "Should exit with code 1 if property doesn't match",
        args: [commandName, "-n", "dalinet", "--unikid", UNIK_ID, "-k", "pr@perty"],
        exitCode: 1,
        mocks: {
            nodeConfigurationCrypto: true,
            blockchain: true,
        },
    },
];
