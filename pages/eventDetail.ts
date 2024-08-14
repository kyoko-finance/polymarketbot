import { Context, Telegraf, Markup } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { MARKETS_BACK_TO_TOPIC, WELCOME_DISMISS_GENERATE_WALLET } from "../utils/constant";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import { formatVolume, sortMarket } from "../utils/utils";
import { IEvent, IMarket } from "./eventList";
import { MyContext } from "../index";



export function showEventDetail(ctx: MyContext, id: string) {
    console.log('id:', id);
    console.log("打印session:", ctx.session)
    if(!ctx.session) {
        return;
    }
    var eventList: IEvent[] | undefined = ctx.session.selectedEventList;
    if (!eventList || eventList.length == 0) {
        return;
    }
    var event: IEvent | undefined;
    eventList.forEach(element => {
        if (element.id === id) {
            event = element;
        }
    })
    console.log('开始构2222', event?.commentCount)
    if (!event) {
        ctx.reply('🥲can not find event.')
        return;
    }
    console.log('开始构建消息')
    var eventDetailMsg = '';

    // var cancelOrderUrl = `https://t.me/polymarket_kbot?start=dt-${event.id.substring(2).slice(0, -5)}`

    eventDetailMsg += `\n• Title: *${event.title.replace(/\./g, '\\.').replace(/\-/g, '\\.')} 📈*\n`
    let currentMarketList: IMarket[] = event.markets;
    sortMarket(currentMarketList);
    let maxLength = currentMarketList.length > 3 ? 3 : currentMarketList.length;
    for (let j = 0; j < maxLength; j++) {//只需要列出前3个
        let market = currentMarketList[j];
        eventDetailMsg += `   *${(j + 1) + '\\.' + market.groupItemTitle.replace(/\./g, '\\.').replace(/\-/g, '\\.')}*    ${Math.round(market.bestAsk * 100)}%    Yes  No\n`;
    }
    eventDetailMsg += `• Bet: ${formatVolume(event.volume).replace('.', '\\.')}`;
    eventDetailMsg += `\n• volume24hr: ${formatVolume(event.volume24hr).replace('.', '\\.')}`
    eventDetailMsg += `\n• commentCount: ${event.commentCount}`
    eventDetailMsg += `\n`;

    var buttons = getEventDetailMenu();
    ctx.replyWithMarkdownV2(eventDetailMsg as string, { reply_markup: { inline_keyboard: buttons }, disable_web_page_preview: true } as ExtraReplyMessage);
}

function getEventDetailMenu() {
    const buttons = [
        Markup.button.callback('× Dismiss Message', WELCOME_DISMISS_GENERATE_WALLET)
    ];
    return buttons;
}