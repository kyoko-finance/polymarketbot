import { Telegraf, Markup, Context } from "telegraf";
import { INDEX_PAGE_MARKETS, INDEX_PAGE_POSITIONS, INDEX_PAGE_OPEN_ORDERS, INDEX_PAGE_HISTORY, INDEX_PAGE_PROFILE, INDEX_PAGE_DISMISS } from "./utils/constant";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { IUserInfo } from "./schema/UserInfo";
import { queryUserInfo } from "./utils/db";
import { approveTokensForTrading } from "./init/approveTokensForTrading";
import { createProxyWallet, getBalance } from "./init/generateProxyWallet";
import { BigNumber } from "ethers";



export async function showIndex(ctx: Context, userInfo: IUserInfo | undefined) {
    var indexMsg = `
    *Polymarket*
Your first polymarket trading bot
───────────────────
📖 [Docs](${process.env.DOCS})
💬 [Official Chat](${process.env.WEBSITE})
🌍 [Website](${process.env.WEBSITE})
\n*The world\\'s largest prediction market\\. *
          `;
    //主页面
    ctx.replyWithMarkdownV2(indexMsg, { reply_markup: { inline_keyboard: getIndexMenu() }, disable_web_page_preview: true } as ExtraReplyMessage);

    await initUserProxyWalletAndApprove(ctx, userInfo);
}

async function initUserProxyWalletAndApprove(ctx: Context, userInfo: IUserInfo | undefined) {
    //approve
    if (!userInfo) {
        userInfo = await queryUserInfo(ctx.from!.id.toString());
    }
    if (!userInfo) {
        return;
    }
    if(userInfo.generateProxyWallet && userInfo.approved) {
        //已经完成初始化操作
        return;
    }

    let balance: BigNumber = await getBalance(userInfo.userAddress);
    if (balance.lt(1000000)) {
        // console.log(`${wallet.address} 余额不足`)
        ctx.reply("Your $POL is insufficient. You must topup some $POL for securely trading❗❗❗")
        return;
    }

    //当确认有matic时才执行下面这段代码
    if (!(userInfo.generateProxyWallet)) {
        let pendingMessage1 = await ctx.reply('generate proxy wallet for trading...');
        let result: boolean = await createProxyWallet(ctx, userInfo._id, userInfo.userAddress, userInfo.userPrivatekey);
        if (result) {
            try {
                await ctx.deleteMessage(pendingMessage1.message_id);
            }catch(error) {
                console.log('delete message failed 1')
            }
        }
    }
    if (!(userInfo.approved)) {
        let pendingMessage2 = await ctx.reply('Approving token for trading...');
        let result: boolean = await approveTokensForTrading(ctx, userInfo._id, userInfo.userPrivatekey, userInfo.proxyWallet);
        if (result) {
            try {
                await ctx.deleteMessage(pendingMessage2.message_id);
            } catch(error) {
                console.log('delete message failed 2');
            }
        }
    }
}

function getIndexMenu() {
    return [[
        {
            text: "🎯 Markets",
            callback_data: INDEX_PAGE_MARKETS
        }
    ], [
        {
            text: "🐠 Positions",
            callback_data: INDEX_PAGE_POSITIONS
        }
    ], [
        {
            text: "🍕 Open orders",
            callback_data: INDEX_PAGE_OPEN_ORDERS
        }
    ], [
        {
            text: "🦄 History",
            callback_data: INDEX_PAGE_HISTORY
        }
    ], [
        Markup.button.callback('🤑 Profile & Assets', INDEX_PAGE_PROFILE),
    ], [
        Markup.button.callback('❌ Close', INDEX_PAGE_DISMISS),
    ]]
}