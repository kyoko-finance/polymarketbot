import { ethers, BigNumber } from "ethers";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

import { safeAbi } from "./safeAbi";
import { erc20Abi } from "./erc20Abi";
import { signAndExecuteSafeTransaction } from "./safe-helpers";

import { Interface } from "ethers/lib/utils";


const ERC20_INTERFACE = new Interface(erc20Abi);

const encodeErc20Transfer = (to: string, value: BigNumber): string => {
    return ERC20_INTERFACE.encodeFunctionData(
        "transfer(address,uint256)",
        [to, value]
    );
}

async function main() {
    console.log(`Starting...`);
    
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon.llamarpc.com`);
    const pk = new ethers.Wallet(`fecfafb7b2da793ce765f9f36adf851f1d7804fc516fa3ff8a497a6504f60682`);
    const wallet = pk.connect(provider);

    console.log(`Address: ${wallet.address}`)

    // =============== Replace the values below with your values ==========================
    // Safe
    const safeAddress = "0x10093a40AeB323301fB0731230cA1b7ac075FF70"; // Replace with your safe address
    const safe = new ethers.Contract(safeAddress, safeAbi, wallet);

    const to = "0x8B234F3EACc90Ee5b143E5DD6499A45D6A7508AC"; // Replace with your destination address
    const value = ethers.utils.parseUnits("1", 6); // Replace with your transfer value
    // Transfers an ERC20 token out of the Safe to the destination address
    const data = encodeErc20Transfer(to, value);
    
    const token = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
    const txn = await signAndExecuteSafeTransaction(wallet, safe, {
        to: token,
        value : '0',
        data: data,
        operation : 0,
    }, {gasPrice: 50000000000});
    
    console.log(`Txn hash: ${txn.hash}`);
    await txn.wait();

    console.log(`Done!`)
}

main();