const { ClobClient } = require("@polymarket/clob-client");
const { ethers } = require("ethers");
require('dotenv/config');


async function getActiveOrders() {
    var host = 'https://clob.polymarket.com/';
    console.log(process.env.PRIVATE_KEY);
    const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const chainId = await wallet.getChainId();

    debugger;

    // Initialization of a client that trades directly from an EOA
    const clobClient = new ClobClient(
        host,
        chainId,
        wallet,
        {
            key: '24927e0e-15f3-933d-0919-c58cbe91a6c5',
            secret: 'jDiBlj-QpXGv40GEq9zXzDJFXAH0zL6FlEylA3KM45E=',
            passphrase: 'd4e866242d0830adf87fa512fdc2a7bcd0870adc4b94e0cb33fe489e25d2f19d'
        },
        0
    );

    console.log(
        await clobClient.getOpenOrders(),
    );
    // console.log(resp);
    // console.log(`Done!`);
}

getActiveOrders();