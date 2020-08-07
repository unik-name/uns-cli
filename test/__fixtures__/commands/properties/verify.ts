import { Utils } from "@uns/ark-crypto";
import { VERIFIED_URL_KEY_PREFIX } from "@uns/ts-sdk";

export const UNIK_ID = "51615becbd39ad96344919dffa7b972f293b0a3973b05145fd6d0a1a20cac169";
export const WALLET = "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA";

export const PASSPHRASE = "reveal front short spend enjoy label element text alert answer select bright";

export const URL = "www.lmao.lol";

export const WALLET_RESULT = {
    data: {
        address: "DDwxZwjZQJUjeu7PxQbLnA5wkt5Pe3ZMGA",
        publicKey: "020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011",
        nonce: "3",
        balance: "9700000000",
        attributes: {
            tokens: {
                tokens: [UNIK_ID],
            },
        },
        isDelegate: false,
        isResigned: false,
    },
};

export const UNIK_RESULT = {
    data: {
        id: UNIK_ID,
        ownerId: WALLET,
        transactions: {
            first: {
                id: "txid",
            },
            last: {
                id: "txid",
            },
        },
    },
    confirmations: 20,
};

const rawJwt = "totojwt";
export const URL_VERIFY_TRANSACTION = {
    id: "7ce8777a1ba0d5979cda8e53fa59d4d5e6b5d50464db90e0ae95b69381d6f6a0",
    signature:
        "9ee1be3a76e97e4e8ae95a31148193557d69cf6d34e36cb7d16044b80289d7713aa41cd5995bd2a06f5d9dbb6e646c53655431b338748c0070b7b6306b23d28b",
    typeGroup: 2001,
    nonce: new Utils.BigNumber(2),
    version: 2,
    type: 4,
    fee: new Utils.BigNumber(100000000),
    senderPublicKey: "020d5e36cce37494811c1a6d8c5e05f744f45990cbcc1274d16914e093a5061011",
    amount: Utils.BigNumber.ZERO,
    timestamp: 12,
    asset: {
        nft: {
            unik: {
                tokenId: UNIK_ID,
                properties: {
                    [`${VERIFIED_URL_KEY_PREFIX}myUrl`]: "https://www.lmao.lol",
                    [`${VERIFIED_URL_KEY_PREFIX}myUrl/proof`]: rawJwt,
                },
            },
        },
        demand: {
            payload: {
                iss: UNIK_ID,
                sub: UNIK_ID,
                iat: 1579507453173,
                cryptoAccountAddress: WALLET,
            },
            signature:
                "3045022100fbff7614e5658b692484efccc4a1e2495e655c7fd95287a1ee857c42b789ca50022018d4f23db7b920a1465276cedb63aac3f923556e7bede080792c59638df16ee4",
        },
        certification: {
            payload: {
                iss: "2b9799c35cbe4e8fb93c79c83aebe229f9f9909d7d13138ba837fca932dada76",
                sub: "6d8f88a373dbdb704dabdfd1ae4311a35484685ef3885c6e08bf7200648a9884",
                iat: 1579507453173,
                cost: new Utils.BigNumber(100000000),
            },
            signature:
                "3045022100fbff7614e5658b692484efccc4a1e2495e655c7fd95287a1ee857c42b789ca50022018d4f23db7b920a1465276cedb63aac3f923556e7bede080792c59638df16ee3",
        },
    },
};

// Expiration free JWT
export const RAWJWT =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1OTYxMjMyNTksImp0aSI6ImtLTWYwNXN4X3YzbnE4MUdRQVMyUyIsImF1ZCI6ImRpZDp1bmlrOnVuaWQ6NTE2MTViZWNiZDM5YWQ5NjM0NDkxOWRmZmE3Yjk3MmYyOTNiMGEzOTczYjA1MTQ1ZmQ2ZDBhMWEyMGNhYzE2OSIsInN1YiI6ImRpZDp1bmlrOnVuaWQ6NTE2MTViZWNiZDM5YWQ5NjM0NDkxOWRmZmE3Yjk3MmYyOTNiMGEzOTczYjA1MTQ1ZmQ2ZDBhMWEyMGNhYzE2OSIsInR5cGUiOiJ1cmwiLCJ2YWx1ZSI6Ind3dy5sbWFvLmxvbCIsImlzcyI6ImRpZDp1bmlrOnVuaWQ6NTE2MTViZWNiZDM5YWQ5NjM0NDkxOWRmZmE3Yjk3MmYyOTNiMGEzOTczYjA1MTQ1ZmQ2ZDBhMWEyMGNhYzE2OSJ9.uynhJ7zXZRgaWpTSye__hkYyV9f13j7PRQSNfipw19ImHqrxAevqSEsBU65PBTQdOeqhNou-FLTUntDT3pJSnw";
