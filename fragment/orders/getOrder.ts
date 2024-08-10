import { ClobClient } from "@polymarket/clob-client";
import { ethers } from "ethers";
import 'dotenv/config';


async function getActiveOrders() {
    var host = 'https://clob.polymarket.com/';
    const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
    const chainId = await wallet.getChainId();

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

    console.log(
        await clobClient.getOrder('0x51844257356e778c71adf0b99a023e7af8d95684622e69faa4ebd24f0e33b6ee'),
    );
    // console.log(resp);
    // console.log(`Done!`);
}

getActiveOrders();