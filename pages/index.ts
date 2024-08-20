import { Telegraf, Markup, Context } from "telegraf";
import { INDEX_PAGE_MARKETS, INDEX_PAGE_POSITIONS, INDEX_PAGE_OPEN_ORDERS, INDEX_PAGE_HISTORY, INDEX_PAGE_PROFILE, INDEX_PAGE_DISMISS } from "../utils/constant";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { IUserInfo } from "../schema/UserInfo";
import { queryUserInfo } from "../utils/db";
import { approveAllowance } from "./approveAllowance";



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
    
    //approve
    if(!userInfo) {
        userInfo = await queryUserInfo(ctx.from!.id.toString());
    }
    if(userInfo != null && !(userInfo.approved)) {
        let result: boolean = await approveAllowance(ctx);
        if(!result) {
            ctx.reply('Tip: you should top up some matic for approve action and some USDC.e for transactions.')
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