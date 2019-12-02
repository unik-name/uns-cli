const statusResultJson = `{
  "height": 693652,
  "network": "dalinet",
  "totalTokenSupply": 21199994,
  "tokenSymbol": "DUNS",
  "numberOfUniks": 1,
  "activeDelegates": 3,
  "lastBlockUrl": "https://dalinet.explorer.uns.network/block/693652"
}
`;

const statusResultYaml = `height: 693652
network: dalinet
totalTokenSupply: 21199994
tokenSymbol: DUNS
numberOfUniks: 1
activeDelegates: 3
lastBlockUrl: https://dalinet.explorer.uns.network/block/693652
`;

const statusResultTable = `height;network;totalTokenSupply;tokenSymbol;numberOfUniks;activeDelegates;lastBlockUrl
693652;dalinet;21199994;DUNS;1;3;https://dalinet.explorer.uns.network/block/693652
`;
const infoNode = "» :info: DEV MODE IS ACTIVATED;\n» :info: node: https://forger1.dalinet.uns.network;\n";

export const outputCases = [
    {
        description: "Should return dalinet status json",
        args: ["status", "--network", "dalinet"],
        expected: statusResultJson,
    },
    {
        description: "Should return dalinet status json verbose",
        args: ["status", "--network", "dalinet", "--verbose"],
        expected: infoNode + statusResultJson,
    },
    {
        description: "Should return dalinet status yaml",
        args: ["status", "--network", "dalinet", "--format", "yaml"],
        expected: statusResultYaml,
    },
    {
        description: "Should return dalinet status yaml verbose",
        args: ["status", "--network", "dalinet", "--format", "yaml", "--verbose"],
        expected: infoNode + statusResultYaml,
    },
    {
        description: "Should return dalinet status table",
        args: ["status", "--network", "dalinet", "--format", "table"],
        expected: statusResultTable,
    },
    {
        description: "Should return dalinet status table verbose",
        args: ["status", "--network", "dalinet", "--format", "table", "--verbose"],
        expected: infoNode + statusResultTable,
    },
    {
        description: "Should use env var and return dalinet status json",
        args: ["status"],
        expected: statusResultJson,
        UNS_NETWORK: "dalinet",
    },
    {
        description: "Should not use env var and return dalinet status json",
        args: ["status", "--network", "dalinet"],
        expected: statusResultJson,
        UNS_NETWORK: "customnetwork",
    },
];
