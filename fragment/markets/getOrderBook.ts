import { BookParams, ClobClient } from "@polymarket/clob-client";
import { SignatureType } from "@polymarket/order-utils";
import { ethers } from "ethers";
import 'dotenv/config';

async function getOrderBook(id: string) {
    const clobClient = initClobClientGnosis();
    if (!clobClient) {
        return null;
    }
    const YES =
        "69236923620077691027083946871148646972011131466059644796654161903044970987404";
    const NO =
        "87584955359245246404952128082451897287778571240979823316620093987046202296181";
    var orderBooks = await clobClient.getOrderBooks([
        { token_id: YES },
    { token_id: NO },] as BookParams[]);
    console.log("长度是：", orderBooks)
    // console.log("getOrderBook:", orderBooks);
    return getOrderBook;
}

function initClobClientGnosis() {
    var host = 'https://clob.polymarket.com/';
    const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
    var privateKey = process.env.PRIVATE_KEY;
    var proxyWallet = '0x10093a40AeB323301fB0731230cA1b7ac075FF70';
    const wallet = new ethers.Wallet(privateKey as string, provider);
    return new ClobClient(
        host,
        137,
        wallet,
        {
            key: process.env.CLOB_API_KEY as string,
            secret: process.env.CLOB_SECRET as string,
            passphrase: process.env.CLOB_PASS_PHRASE as string
        }, // creds
        SignatureType.POLY_GNOSIS_SAFE,
        proxyWallet
    );
}

getOrderBook('2068364980');