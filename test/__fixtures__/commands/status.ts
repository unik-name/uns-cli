const statusResultJson = `{
  "height": 100015,
  "network": "devnet",
  "totalTokenSupply": 21199994,
  "tokenSymbol": "DUNS",
  "numberOfUniks": 1,
  "activeDelegates": 7,
  "lastBlockUrl": "https://explorer.devnet.uns.network/block/100015"
}
`;

const statusResultYaml = `height: 100015
network: devnet
totalTokenSupply: 21199994
tokenSymbol: DUNS
numberOfUniks: 1
activeDelegates: 7
lastBlockUrl: https://explorer.devnet.uns.network/block/100015
`;

const statusResultTable = `height;network;totalTokenSupply;tokenSymbol;numberOfUniks;activeDelegates;lastBlockUrl
100015;devnet;21199994;DUNS;1;7;https://explorer.devnet.uns.network/block/100015
`;
const infoNode = ":info: node: https://forger1.devnet.uns.network\n";

export const outputCases = [
    {
        description: "Should return devnet status json",
        args: ["status", "--network", "devnet"],
        expected: statusResultJson,
    },
    {
        description: "Should return devnet status json verbose",
        args: ["status", "--network", "devnet", "--verbose"],
        expected: infoNode + statusResultJson,
    },
    {
        description: "Should return devnet status yaml",
        args: ["status", "--network", "devnet", "--format", "yaml"],
        expected: statusResultYaml,
    },
    {
        description: "Should return devnet status yaml verbose",
        args: ["status", "--network", "devnet", "--format", "yaml", "--verbose"],
        expected: infoNode + statusResultYaml,
    },
    {
        description: "Should return devnet status table",
        args: ["status", "--network", "devnet", "--format", "table"],
        expected: statusResultTable,
    },
    {
        description: "Should return devnet status table verbose",
        args: ["status", "--network", "devnet", "--format", "table", "--verbose"],
        expected: infoNode + statusResultTable,
    },
];
