// GTC Order example
import { ClobClient, Side, OrderType } from "@polymarket/clob-client";
import { initClobClientEOA, initClobClientEmail, initClobClientGnosis } from '../../clobClientInit';
import 'dotenv/config';

async function main() {
    // Initialization of a client that trades directly from an EOA
    const clobClient = initClobClientEOA();

    // Create a buy order for 100 YES for 0.50c
    // YES: 71321045679252212594626385532706912750332728571942532289631379312455583992563
    const order = await clobClient.createOrder({
        tokenID:
            "67651190137384692436254313465446414883079283131079052933923486306417976524160",
        price: 0.17,
        side: Side.SELL,
        size: 95.238,
        feeRateBps: 0,
        nonce: 0,
    });
    console.log("Created Order", order);

    // Send it to the server

    // GTC Order
    const resp = await clobClient.postOrder(order, OrderType.GTC);
    console.log(resp);
}

main();