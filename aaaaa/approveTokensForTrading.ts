import { ethers, BigNumber } from "ethers";
import { Interface } from "ethers/lib/utils";

import { safeAbi } from "./safeAbi";
import { aggregateTransaction, signAndExecuteSafeTransaction } from "./safe-helpers";
import { OperationType, SafeTransaction } from "./types";

import { erc20Abi } from "./erc20Abi"
import { erc1155Abi } from "./erc1155Abi"


const ERC20_INTERFACE = new Interface(erc20Abi);
const ERC1155_INTERFACE = new Interface(erc1155Abi);

export const encodeErc20Approve = (spender: string, approvalAmount: BigNumber): string => {
    return ERC20_INTERFACE.encodeFunctionData(
        "approve(address,uint256)",
        [spender, approvalAmount]
    );
}

export const encodeErc1155Approve = (spender: string, approval: boolean): string => {
    return ERC1155_INTERFACE.encodeFunctionData(
        "setApprovalForAll(address,bool)",
        [spender, approval],
    );
}


// This example does all approvals necessary for trading
// Approves:
// USDC on the CTF Contract
// USDC on the CTF Exchange Contract
// USDC on the Neg Risk Exchange Contract
// CTF Outcome Tokens on the CTF Exchange Contract
// CTF Outcome Tokens on the Neg Risk Exchange Contract
async function main(privateKey: string, safeAddress: string) {
    console.log(`Starting...`);
    
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon.llamarpc.com`);
    const pk = new ethers.Wallet(privateKey);
    const wallet = pk.connect(provider);

    console.log(`Address: ${wallet.address}`)

    // Safe
    // const safeAddress = ""; // Replace with your safe address
    const safe = new ethers.Contract(safeAddress, safeAbi, wallet);
    
    const usdcSpenders = [
        "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045", // Conditional Tokens Framework
        "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E", // CTF Exchange
        "0xC5d563A36AE78145C45a50134d48A1215220f80a", // Neg Risk CTF Exchange
        "0xd91e80cf2e7be2e162c6513ced06f1dd0da35296",
    ];

    const outcomeTokenSpenders = [
        "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E", // CTF Exchange
        "0xC5d563A36AE78145C45a50134d48A1215220f80a", // Neg Risk Exchange
        "0xd91e80cf2e7be2e162c6513ced06f1dd0da35296",
    ];

    const safeTxns: SafeTransaction[] = [];
    
    for(const spender of usdcSpenders) {
        safeTxns.push(
            {
                to: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                data: encodeErc20Approve(spender, ethers.constants.MaxUint256),
                operation: OperationType.Call,
                value: "0",
            }
        );
    }

    for(const spender of outcomeTokenSpenders) {
        safeTxns.push(
            {
                to: '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045',
                data: encodeErc1155Approve(spender, true),
                operation: OperationType.Call,
                value: "0",
            }
        );
    }

    const safeTxn = aggregateTransaction(safeTxns);
    const txn = await signAndExecuteSafeTransaction(wallet, safe, safeTxn, {gasPrice: 50000000000});
    
    console.log(`Txn hash: ${txn.hash}`);
    await txn.wait();

    console.log(`Done!`)
}

