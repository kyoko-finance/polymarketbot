const { ClobClient } = require("@polymarket/clob-client");
const { SignatureType } = require("@polymarket/order-utils");
const { ethers } = require("ethers");
require('dotenv/config');


async function getActiveOrders() {
    
    

    // Initialization of a client that trades directly from an EOA
    const clobClient = initClobClientGnosis();

    console.log(
        await clobClient.getOpenOrders(),
    );
    // console.log(resp);
    // console.log(`Done!`);
}

function initClobClientGnosis() {
    var host = 'https://clob.polymarket.com/';
    const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
    var privateKey = process.env.PRIVATE_KEY;
    var proxyWallet = '0x10093a40AeB323301fB0731230cA1b7ac075FF70';
    const wallet = new ethers.Wallet(privateKey, provider);
    return new ClobClient(
        host,
        137,
        wallet,
        {
            key: process.env.CLOB_API_KEY,
            secret: process.env.CLOB_SECRET,
            passphrase: process.env.CLOB_PASS_PHRASE
        }, // creds
        SignatureType.POLY_GNOSIS_SAFE,
        proxyWallet
    );
}

getActiveOrders();