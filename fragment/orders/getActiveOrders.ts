import { ClobClient } from "@polymarket/clob-client";
import { ethers } from "ethers";
import 'dotenv/config';


async function getActiveOrders() {
    var host = process.env.CLOB_HOST;
    const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
    const chainId = await wallet.getChainId();

    console.log('key:', process.env.CLOB_API_KEY);
    console.log('secret:', process.env.CLOB_SECRET);
    console.log('phrase:', process.env.CLOB_PASS_PHRASE);

    // Initialization of a client that trades directly from an EOA
    const clobClient = new ClobClient(
        host as string,
        chainId as number,
        wallet as ethers.Wallet | ethers.providers.JsonRpcSigner,
        {
            key: process.env.CLOB_API_KEY as string,
            secret: process.env.CLOB_SECRET as string,
            passphrase: process.env.CLOB_PASS_PHRASE as string
        }
    );

    const resp = await clobClient.getOpenOrders();
    console.log(resp);
    console.log(`Done!`);
}

getActiveOrders();