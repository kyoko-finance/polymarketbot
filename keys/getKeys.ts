import { ClobClient } from "@polymarket/clob-client";
import { ethers } from "ethers";
import 'dotenv/config';


async function getApiKeys() {
    var host = 'https://clob.polymarket.com/';
    const provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com/');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
    const chainId = await wallet.getChainId();

    // Initialization of a client that trades directly from an EOA
    const clobClient = new ClobClient(
        host as string,
        chainId as number,
        wallet as ethers.Wallet | ethers.providers.JsonRpcSigner,
        {
            key: 'b89d3269-28dc-50b3-e6db-291f85073017',
            secret: 'yrhlXIOM6eF9_UxavhbaOmRg4WP3sUE4Og2VsWWKPN0=',
            passphrase: 'fa70f4d6d42088b8f02c1547b7396b74c6553f81a3bf0fa8ce1343aba3a62d25'
        }
    );

    const apiKeys = await clobClient.getApiKeys();
    console.log(apiKeys);
    //结果
    //{ apiKeys: [ 'a0a6faae-1d31-00b2-663d-a57113e4d378' ] }
}

getApiKeys();