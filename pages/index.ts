import { Telegraf, Markup, Context } from "telegraf";
import { INDEX_PAGE_MARKETS, INDEX_PAGE_POSITIONS, INDEX_PAGE_OPEN_ORDERS, INDEX_PAGE_HISTORY, INDEX_PAGE_PROFILE, INDEX_PAGE_DISMISS } from "../utils/constant";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";



export function showIndex(ctx: Context) {
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