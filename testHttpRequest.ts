import { ClobClient } from "@polymarket/clob-client";
import { ethers } from "ethers";
import 'dotenv/config';
import axios from "axios";
import crypto from 'crypto';


// 示例 Secret 和 Message
const secret = 'jDiBlj-QpXGv40GEq9zXzDJFXAH0zL6FlEylA3KM45E=';
const message = 'This message attests that I control the given wallet';

// 生成 HMAC
function generateHMAC(secret: string, message: string): string {
    return crypto.createHmac('sha256', secret)
        .update(message)
        .digest('hex');
}

async function getOpenOrders() {
    // var sign = await generateSignature();

    // const category = await axios.get(`https://clob.polymarket.com/data/orders`, {
    //     headers: {
    //         'POLY_ADDRESS': '0x78eF948456cD33bB821d73078BAC36bd51EB455b',
    //         'POLY_SIGNATURE': generateHMAC(secret, message),
    //         'POLY_TIMESTAMP': sign.serverTime,
    //         'POLY_API_KEY': '24927e0e-15f3-933d-0919-c58cbe91a6c5',
    //         'POLY_PASSPHRASE': 'd4e866242d0830adf87fa512fdc2a7bcd0870adc4b94e0cb33fe489e25d2f19d',
    //     }
    // });
    // console.log(`category: `);
    // var data = category.data;
    // console.log(data);
}

getOpenOrders();

async function generateSignature() {
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

    const serverTime = await clobClient.getServerTime();
    console.log('服务器时间：', serverTime);

    const domain = {
        name: "ClobAuthDomain",
        version: "1",
        chainId: chainId, // Polygon ChainID 137
    };

    const types = {
        ClobAuth: [
            { name: "address", type: "address" },
            { name: "timestamp", type: "string" },
            { name: "nonce", type: "uint256" },
            { name: "message", type: "string" },
        ],
    };
    const value = {
        address: wallet.address, // the Signing address
        timestamp: serverTime, // The CLOB API server timestamp
        nonce: serverTime, // The nonce used
        message: "This message attests that I control the given wallet", // A static message indicating that the user controls the wallet
    };
    const sig = await wallet._signTypedData(domain, types, value);
    return { sig, serverTime };
}