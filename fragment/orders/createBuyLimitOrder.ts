// GTC Order example
//
import { ClobClient, Side, OrderType } from "@polymarket/clob-client";
import { initClobClientEOA, initClobClientEmail, initClobClientGnosis } from '../../clobClientInit';
import { ethers } from "ethers";
import 'dotenv/config';

async function main() {

    var host = 'https://clob.polymarket.com/';
    const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
    const chainId = await wallet.getChainId();

    // Initialization of a client that trades directly from an EOA
    const clobClient = initClobClientGnosis();

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