// GTC Order example
import { ClobClient, Side, OrderType } from "@polymarket/clob-client";
import { initClobClientEOA, initClobClientEmail, initClobClientGnosis } from '../../clobClientInit';
import 'dotenv/config';

async function main() {
    // Initialization of a client that trades directly from an EOA
    const clobClient = initClobClientGnosis();

    // Create a buy order for 100 YES for 0.50c
    // YES: 71321045679252212594626385532706912750332728571942532289631379312455583992563
    const order = await clobClient.createOrder({
        tokenID:
            "21742633143463906290569050155826241533067272736897614950488156847949938836455",//川普Yes TOKEN
        price: 0.88,
        side: Side.SELL,
        size: 14.545453,
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