import { ethers } from "ethers";
import 'dotenv/config';
import { initClobClientEOA, initClobClientEmail, initClobClientGnosis } from '../../clobClientInit';

async function main() {
    const clobClient = initClobClientGnosis();

    const YES_TOKEN_ID =
        "21742633143463906290569050155826241533067272736897614950488156847949938836455";
    const NO_TOKEN_ID =
        "48331043336612883890938759509493159234755048973500640148014422747788308965732";

    clobClient.getPrice(YES_TOKEN_ID, "buy").then((price: any) => console.log("YES", "BUY", price));
    clobClient
        .getPrice(YES_TOKEN_ID, "sell")
        .then((price: any) => console.log("YES", "SELL", price));
    clobClient.getPrice(NO_TOKEN_ID, "buy").then((price: any) => console.log("NO", "BUY", price));
    clobClient.getPrice(NO_TOKEN_ID, "sell").then((price: any) => console.log("NO", "SELL", price));
}

main();
