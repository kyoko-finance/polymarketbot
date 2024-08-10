import { ClobClient } from "@polymarket/clob-client";
import { ethers } from "ethers";
import 'dotenv/config';
import axios from "axios";


async function generateSignature() {
    var host = 'https://clob.polymarket.com/';
    const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
    const wallet = new ethers.Wallet('', provider);
    
    const domain = {
      verifyingContract: '0xaacfeea03eb1561c4e67d661e40682bd20e3541b',
      name: "Polymarket Contract Proxy Factory",
      chainId: '137', // Polygon ChainID 137
    };
  
    const types = {
      CreateProxy: [
        { name: "paymentToken", type: "address" },
        { name: "payment", type: "uint256" },
        { name: "paymentReceiver", type: "address" }
      ],
    };
    const value = {
      paymentToken: '0x0000000000000000000000000000000000000000', // the Signing address
      payment: 0, // The CLOB API server timestamp
      paymentReceiver: '0x0000000000000000000000000000000000000000' // The nonce used
    };
    const sig = await wallet._signTypedData(domain, types, value);
  
    console.log('sig:', sig);
    return sig;
  }

async function createProxy() {
    const market = await axios.post('https://matic-gsn-v2-2.polymarket.io/create-safe-proxy', {
        paymentToken: '0x0000000000000000000000000000000000000000',
        payment: '0x00',
        paymentReceiver: '0x0000000000000000000000000000000000000000',
        signature: await generateSignature()
    });
    console.log(`proxy: `);
    console.log(market);
}

createProxy();