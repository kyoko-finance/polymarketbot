import { ethers, BigNumber } from "ethers";

import { safeAbi } from "../utils/polyUtils/abis/safeAbi";
import { encodeErc20Transfer } from "../utils/polyUtils/encode";
import { signAndExecuteSafeTransaction } from "../utils/polyUtils/safe-helpers";
import 'dotenv/config';
import { MyContext } from "../index";
import { queryUserInfo } from "../utils/db";
import { queryCash } from "./profile";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { IUserInfo } from "../schema/UserInfo";
import { isValidUSDCNumber } from "../utils/utils";


export async function handleWithdraw(ctx: MyContext) {
    let userInfo = await queryUserInfo(ctx.from!.id.toString());
    if (!userInfo) {
        return;
    }
    let cash: BigNumber = await queryCash(userInfo.proxyWallet);
    let cashAmount = ethers.utils.formatUnits(cash, 6);
    console.log(cashAmount)

    await ctx.replyWithMarkdownV2(`*Your cash is: ${parseFloat(cashAmount).toFixed(2).replace('.', '\\.')}*\nPlease enter the amount you wish to withdraw:`, {
        reply_to_message_id: ctx.message?.message_id,
        reply_markup: {
            force_reply: true,
            input_field_placeholder: 'Input USDC amount'
        }
    } as ExtraReplyMessage);
    ctx.session!.currentInputWithdrawUsdcState = true;
}


export async function withdraw(ctx: MyContext, withdrawAmount: string) {
    let currentInputWithdrawUsdcState = ctx.session!.currentInputWithdrawUsdcState;
    if (!currentInputWithdrawUsdcState) {
        return false;
    }

    if (!isValidUSDCNumber(withdrawAmount)) {
        ctx.reply('input illegal');
        return false;
    }
    let userInfo = await queryUserInfo(ctx.from!.id.toString());
    if (!userInfo) {
        return false;
    }
    let destAddress = userInfo.userAddress;
    let privateKey = userInfo.userPrivatekey;
    let proxyWallet = userInfo.proxyWallet;

    const provider = new ethers.providers.JsonRpcProvider(`${process.env.POLYGON_RPC}`);
    const pk = new ethers.Wallet(privateKey);
    const wallet = pk.connect(provider);

    console.log(`Address: ${wallet.address}`)

    const balance = await provider.getBalance(userInfo.userAddress);
    if (balance.lt(1e6)) {
        ctx.reply('You have too few matic.')
        return false;
    }

    let withdrawAmountInWei = BigNumber.from(parseFloat(withdrawAmount) * 1e6)
    let cash: BigNumber = await queryCash(userInfo.proxyWallet);
    if (withdrawAmountInWei.gt(cash)) {
        ctx.reply('The amount you withdraw is greater than cash.')
        return false;
    }

    // Safe
    const safe = new ethers.Contract(proxyWallet, safeAbi, wallet);

    // Transfers an ERC20 token out of the Safe to the destination address
    const data = encodeErc20Transfer(destAddress, withdrawAmountInWei);

    let pendingMessage = await ctx.reply('transcation is pending...');
    ctx.session!.currentInputWithdrawUsdcState = false;

    const gasPrice = await provider.getGasPrice();
    const token = process.env.USDCE;
    const txn = await signAndExecuteSafeTransaction(wallet, safe, {
        to: token!,
        value: '0',
        data: data,
        operation: 0,
    }, { gasPrice: gasPrice.mul(ethers.BigNumber.from(11)).div(ethers.BigNumber.from(10)) });

    console.log(`Txn hash: ${txn.hash}`);
    await txn.wait();
    ctx.deleteMessage(pendingMessage.message_id);
    ctx.reply('🎉🎉🎉USDC withdraw success.');
    return true;
}