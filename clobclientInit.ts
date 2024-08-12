import { ClobClient } from "@polymarket/clob-client";
import { SignatureType } from "@polymarket/order-utils";
import { queryUserInfo } from "./utils/db";
import { ethers } from "ethers";
import 'dotenv/config';
import UserInfo, { IUserInfo } from './schema/UserInfo';

var host = process.env.CLOB_HOST;
const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);
const chainId = Number(process.env.CHAIN_ID);

// Initialization of a client that trades directly from an EOA
export function initClobClient(privateKey: string) {
    const wallet = new ethers.Wallet(privateKey, provider);
    return new ClobClient(
        host as string,
        chainId,
        wallet as ethers.Wallet | ethers.providers.JsonRpcSigner,
    );
}

export function initClobClientEOA(privateKey: string) {
    const wallet = new ethers.Wallet(privateKey, provider);
    return new ClobClient(
        host as string,
        chainId,
        wallet as ethers.Wallet | ethers.providers.JsonRpcSigner,
    );
}

// Initialization of a client using a Polymarket Proxy associated with an Email/Magic account
// 0x10093a40AeB323301fB0731230cA1b7ac075FF70
export function initClobClientEmail(privateKey: string, proxyWallet: string) {
    const wallet = new ethers.Wallet(privateKey, provider);
    return new ClobClient(
        host as string,
        chainId,
        wallet as ethers.Wallet | ethers.providers.JsonRpcSigner,
        undefined, // creds
        SignatureType.POLY_PROXY,
        proxyWallet
    );
}

// Initialization of a client using a Polymarket Proxy Wallet associated with a Browser Wallet(Metamask, Coinbase Wallet)
// 0x10093a40AeB323301fB0731230cA1b7ac075FF70
export async function initClobClientGnosis(id: string) {
    var userInfo: IUserInfo | undefined = await queryUserInfo(id);
    if (!userInfo) {
        return
    }
    const wallet = new ethers.Wallet(userInfo.userPrivatekey, provider);
    return new ClobClient(
        host as string,
        chainId,
        wallet as ethers.Wallet | ethers.providers.JsonRpcSigner,
        {
            key: userInfo.clobApiKey as string,
            secret: userInfo.clobSecret as string,
            passphrase: userInfo.clobPassPhrase as string
        }, // creds
        SignatureType.POLY_GNOSIS_SAFE,
        userInfo.proxyWallet
    );
}