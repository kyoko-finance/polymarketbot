import { ClobClient } from "@polymarket/clob-client";
import { ethers } from "ethers";
import 'dotenv/config';
import axios from "axios";

async function getUser() {
    const user = await axios.get(`https://gamma-api.polymarket.com/users`, {
        headers: {
            'POLY_ADDRESS': '0x78eF948456cD33bB821d73078BAC36bd51EB455b',
            'POLY_SIGNATURE': await generateSignature(),
            'POLY_TIMESTAMP': Date.now(),
            'POLY_NONCE': Date.now()
        }
    });
    console.log(user);
}

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
        timestamp: await clobClient.getServerTime(), // The CLOB API server timestamp
        nonce: generateNonce(), // The nonce used
        message: "This message attests that I control the given wallet", // A static message indicating that the user controls the wallet
      };
      const sig = await wallet._signTypedData(domain, types, value);
      return sig;
}

function generateNonce() {
    const timestamp = Date.now(); // 当前时间戳
    return `${timestamp}`; // 将时间戳和随机数结合起来生成 nonce
  }

getUser();