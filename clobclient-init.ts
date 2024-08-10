import { ClobClient } from "@polymarket/clob-client";
import { SignatureType } from "@polymarket/order-utils";
import { ethers } from "ethers";
import 'dotenv/config';

var host = process.env.CLOB_HOST;
const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);
const chainId = Number(process.env.CHAIN_ID);

// Initialization of a client that trades directly from an EOA
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
export function initClobClientGnosis(privateKey: string, proxyWallet: string) {
    const wallet = new ethers.Wallet(privateKey, provider);
    return new ClobClient(
        host as string,
        chainId,
        wallet as ethers.Wallet | ethers.providers.JsonRpcSigner,
        {
            key: process.env.CLOB_API_KEY as string,
            secret: process.env.CLOB_SECRET as string,
            passphrase: process.env.CLOB_PASS_PHRASE as string
        }, // creds
        SignatureType.POLY_GNOSIS_SAFE,
        proxyWallet
    );
}