import { ethers, BigNumber } from "ethers";
import 'dotenv/config';
import { IUserInfo } from "../../schema/UserInfo";
import { Context } from "telegraf";
import { queryUserInfo } from "../../utils/db";
import { updateProfile } from "./profile";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { erc20Abi } from "../../utils/polyUtils/abis/erc20Abi";
import { MyContext } from "../../index";
import { isValidAmountOrPrice, isValidUSDCNumber } from "../../utils/utils";


export async function handleDeposit(ctx: MyContext) {
    let userInfo = await queryUserInfo(ctx.from!.id.toString());
    if(!userInfo) {
        return;
    }
    let balance = await getERC20Balance(process.env.USDCE as string, userInfo.userAddress);
    let balanceAmount = ethers.utils.formatUnits(balance, 6);
    console.log(balanceAmount)

    await ctx.replyWithMarkdownV2(`*Your USDC balance is: ${parseFloat(balanceAmount).toFixed(2).replace('.', '\\.')}*\nPlease enter the amount you wish to deposit:`, {
        reply_to_message_id: ctx.message?.message_id,
        reply_markup: {
            force_reply: true,
            input_field_placeholder: 'Input USDC amount'
        }
    } as ExtraReplyMessage);
    ctx.session!.currentInputDepositUsdcState = true;
}

export async function deposit(ctx: MyContext, amountInUSDC: string) {
    let currentInputDepositUsdcState = ctx.session!.currentInputDepositUsdcState;
    if(!currentInputDepositUsdcState) {
        return false;
    }
    
    if(!isValidUSDCNumber(amountInUSDC)) {
        ctx.reply('input illegal');
        return false;
    }
    let userInfo = await queryUserInfo(ctx.from!.id.toString());
    if (!userInfo) {
        return false;
    }
    let privateKey = userInfo.userPrivatekey;

    const polygonProvider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);
    const balance = await polygonProvider.getBalance(userInfo.userAddress);
    if (balance.lt(parseFloat(amountInUSDC) * 1e6)) {
        ctx.reply('You have too few usdc.')
        return false;
    }

    const amount = ethers.utils.parseUnits(amountInUSDC, 6);
    if (balance < amount) {
        ctx.reply('Your USDC is insufficient.')
        // ctx.session!.currentInputDepositUsdcState = false;
        return false;
    }
    const usdcAbi = [
        "function transfer(address to, uint256 amount) public returns (bool)"
    ];

    let pendingMessage = await ctx.reply('Transcation is pending...');

    ctx.session!.currentInputDepositUsdcState = false;

    const gasPrice = await polygonProvider.getGasPrice();
    const senderWallet = new ethers.Wallet(privateKey, polygonProvider);
    const usdcContract = new ethers.Contract(process.env.USDCE!, usdcAbi, senderWallet);
    const txnResponse = await usdcContract.transfer(userInfo.proxyWallet, amount, {
        gasPrice: gasPrice.mul(ethers.BigNumber.from(11)).div(ethers.BigNumber.from(10)),
    });

    console.log(`Transaction sent: ${txnResponse.hash}`);

    // 等待交易确认
    const receipt = await txnResponse.wait();
    ctx.deleteMessage(pendingMessage.message_id);
    ctx.reply('🎉🎉🎉USDC topup success.')
    return true;
}

async function getERC20Balance(token: string, address: string) {
    const polygonProvider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);
    var USDCContract = new ethers.Contract(token, erc20Abi, polygonProvider);
    var erc20Balance = await USDCContract.balanceOf(address);
    return erc20Balance;
}