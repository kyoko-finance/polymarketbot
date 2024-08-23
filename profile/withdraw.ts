import { ethers, BigNumber } from "ethers";

import { safeAbi } from "../utils/polyUtils/abis/safeAbi";
import { encodeErc20Transfer } from "../utils/polyUtils/encode";
import { signAndExecuteSafeTransaction } from "../utils/polyUtils/safe-helpers";
import 'dotenv/config';



export async function withdraw(privateKey: string, proxyWallet: string, destAddress: string, withdrawAmount: BigNumber) {
    const provider = new ethers.providers.JsonRpcProvider(`${process.env.POLYGON_RPC}`);
    const pk = new ethers.Wallet(privateKey);
    const wallet = pk.connect(provider);

    console.log(`Address: ${wallet.address}`)

    // Safe
    const safe = new ethers.Contract(proxyWallet, safeAbi, wallet);

    // Transfers an ERC20 token out of the Safe to the destination address
    const data = encodeErc20Transfer(destAddress, withdrawAmount);

    const token = process.env.USDCE;
    const txn = await signAndExecuteSafeTransaction(wallet, safe, {
        to: token!,
        value: '0',
        data: data,
        operation: 0,
    });

    console.log(`Txn hash: ${txn.hash}`);
    await txn.wait();
}