const statusResultJson = `{
  "height": 693652,
  "network": "dalinet",
  "totalTokenSupply": 21199994,
  "tokenSymbol": "DUNS",
  "NFTs": [
    {
      "nftName": "UNIK",
      "individual": "10",
      "organization": "3",
      "network": "1"
    }
  ],
  "activeDelegates": 3,
  "lastBlockUrl": "https://dalinet.explorer.uns.network/block/693652"
}
`;

const statusResultYaml = `height: 693652
network: dalinet
totalTokenSupply: 21199994
tokenSymbol: DUNS
NFTs:
  - nftName: UNIK
    individual: "10"
    organization: "3"
    network: "1"
activeDelegates: 3
lastBlockUrl: https://dalinet.explorer.uns.network/block/693652
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
