import { ClobClient } from "@polymarket/clob-client";
import { ethers } from "ethers";
import 'dotenv/config';


async function deriveKeys() {
    var host = 'https://clob.polymarket.com/';
    const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
    const chainId = await wallet.getChainId();

    // Initialization of a client that trades directly from an EOA
    const clobClient = new ClobClient(
        host as string,
        chainId as number,
        wallet as ethers.Wallet | ethers.providers.JsonRpcSigner
    );

    var nonce = 0;

    const creds = await clobClient.deriveApiKey(nonce); // nonce defaults to 0
    console.log(creds);
}

deriveKeys();