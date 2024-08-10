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

    const nonce = Date.now();
    console.log("create order nonce--------", nonce)

    // Create a buy order for 100 YES for 0.50c
    // YES: 71321045679252212594626385532706912750332728571942532289631379312455583992563
    const order = await clobClient.createOrder({
        tokenID:
            "67651190137384692436254313465446414883079283131079052933923486306417976524160",
        price: 0.08,
        side: Side.BUY,
        size: 20,
        feeRateBps: 100,
        nonce: 0,
    });
    console.log("Created Order", order);

    // Send it to the server

    // GTC Order
    const resp = await clobClient.postOrder(order, OrderType.GTC);
    console.log(resp);
}

main();

// FOK Order example

async function CreateFOKOrder() {
    // Create a buy order for 100 YES for 0.50c that expires in 1 minute
    // YES: 71321045679252212594626385532706912750332728571942532289631379312455583992563


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

    const oneMinute = parseInt(
        ((new Date().getTime() + 60 * 1000 + 10 * 1000) / 1000).toString()
    );

    const nonce = Math.floor(Date.now() / 1000);
    console.log("create order nonce--------", nonce)

    const marketOrder = await clobClient.createMarketBuyOrder({
        tokenID:
            "67651190137384692436254313465446414883079283131079052933923486306417976524160",
        amount: 20,
        feeRateBps: 0,
        nonce: 0,
        price: 0.21,
    });
    console.log("Created Order", marketOrder);

    // Send it to the server

    // FOK Order
    const resp = await clobClient.postOrder(marketOrder, OrderType.FOK);
    console.log(resp);
}

// CreateFOKOrder();