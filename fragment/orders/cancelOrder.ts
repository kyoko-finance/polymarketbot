// GTC Order example
//
import { ClobClient, Side, OrderType } from "@polymarket/clob-client";
import { ethers } from "ethers";
import 'dotenv/config';

async function main() {

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

    // Send it to the server
  const resp = await clobClient.cancelOrder({
    orderID:
      "0xe113c3c46724c8a001e523a24e497a1550faee8d3ddf4c6e773fdeb964c692d8",
  });
  console.log(resp);
  console.log(`Done!`);
}

main();