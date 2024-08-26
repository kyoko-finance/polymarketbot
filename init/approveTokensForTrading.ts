import { ethers } from "ethers";

import { safeAbi } from "../utils/polyUtils/abis/safeAbi";
import { encodeErc1155Approve, encodeErc20Approve } from "../utils/polyUtils/encode";
import { aggregateTransaction, signAndExecuteSafeTransaction } from "../utils/polyUtils/safe-helpers";
import { OperationType, SafeTransaction } from "../utils/polyUtils/types";
import UserInfo from "../schema/UserInfo";

import 'dotenv/config';
import { Context } from "telegraf";

const CONDITIONAL_TOKENS_FRAMEWORK_ADDRESS = '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045';
const USDC_ADDRESS = process.env.USDCE;


// This example does all approvals necessary for trading
// Approves:
// USDC on the CTF Contract
// USDC on the CTF Exchange Contract
// USDC on the Neg Risk Exchange Contract
// CTF Outcome Tokens on the CTF Exchange Contract
// CTF Outcome Tokens on the Neg Risk Exchange Contract
export async function approveTokensForTrading(ctx: Context, userId: string, privateKey: string, proxyWallet: string) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(`${process.env.POLYGON_RPC}`);
        const pk = new ethers.Wallet(privateKey);
        const wallet = pk.connect(provider);

        console.log(`Address: ${wallet.address}`)

        const balance = await provider.getBalance(wallet.address);
        console.log('balance:' + balance);
        if(balance.lt(1000000)) {
            // console.log(`${wallet.address} 余额不足`)
            ctx.reply("Your Matic is insufficient. You must approve tokens for securely trading❗❗❗")
            return false;
        }

        let pendingMessage = ctx.reply('Approve transaction is pending...');

        // Safe
        const safe = new ethers.Contract(proxyWallet, safeAbi, wallet);

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

        for (const spender of usdcSpenders) {
            safeTxns.push(
                {
                    to: USDC_ADDRESS!,
                    data: encodeErc20Approve(spender, ethers.constants.MaxUint256),
                    operation: OperationType.Call,
                    value: "0",
                }
            );
        }

        for (const spender of outcomeTokenSpenders) {
            safeTxns.push(
                {
                    to: CONDITIONAL_TOKENS_FRAMEWORK_ADDRESS,
                    data: encodeErc1155Approve(spender, true),
                    operation: OperationType.Call,
                    value: "0",
                }
            );
        }

        // 获取当前的 gas price
        const gasPrice = await provider.getGasPrice();
        // 将 gas price 乘以 1.2
        const adjustedGasPrice = gasPrice.mul(ethers.BigNumber.from(12)).div(ethers.BigNumber.from(10));

        const safeTxn = aggregateTransaction(safeTxns);
        const txn = await signAndExecuteSafeTransaction(wallet, safe, safeTxn, { gasPrice: adjustedGasPrice });

        console.log(`Txn hash: ${txn.hash}`);

        ctx.deleteMessage((await pendingMessage).message_id);
        ctx.reply('Approve success.')

        await txn.wait();
        let result = await UserInfo.findByIdAndUpdate(
            userId,
            { approved: true },
            { new: true, runValidators: true }
        );
        return true;
    } catch (error) {
        return false;
    }
}