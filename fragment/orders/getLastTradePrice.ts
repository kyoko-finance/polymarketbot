import { ethers } from "ethers";
import 'dotenv/config';
import { BookParams, ClobClient, Side } from "@polymarket/clob-client";
import { SignatureType } from "@polymarket/order-utils";


async function main() {
    const clobClient = initClobClientGnosis();

    const YES =
        "69236923620077691027083946871148646972011131466059644796654161903044970987404";
    const NO =
        "87584955359245246404952128082451897287778571240979823316620093987046202296181";

    // console.log(await clobClient.getLastTradePrice(YES));
    // console.log('---------------------')
    // console.log(await clobClient.getLastTradePrice(NO));

    // console.log('*****************')

    const prices = await clobClient.getPrices([
        { token_id: YES, side: Side.BUY },
        { token_id: YES, side: Side.SELL },
        { token_id: NO, side: Side.BUY },
        { token_id: NO, side: Side.SELL },
    ]);

    console.log(prices);
}

function initClobClientGnosis() {
    var host = 'https://clob.polymarket.com/';
    const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
    var privateKey = process.env.PRIVATE_KEY;
    var proxyWallet = '0x10093a40AeB323301fB0731230cA1b7ac075FF70';
    const wallet = new ethers.Wallet(privateKey as string, provider);
    return new ClobClient(
        host,
        137,
        wallet,
        {
            key: process.env.CLOB_API_KEY as string,
            secret: process.env.CLOB_SECRET as string,
            passphrase: process.env.CLOB_PASS_PHRASE as string
        }, // creds
        SignatureType.POLY_GNOSIS_SAFE,
        proxyWallet
    );
}

main();
