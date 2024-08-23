import { Context, Telegraf, Markup } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { MARKETS_BACK_TO_TOPIC, WELCOME_DISMISS_GENERATE_WALLET } from "../utils/constant";
import { ExtraEditMessageText, ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { formatString, formatVolume, sortMarket } from "../utils/utils";
import { IEvent, IMarket } from "./eventList";
import { MyContext } from "../index";



export function showEventDetail(ctx: MyContext, id: string) {
    //删除/start消息
    ctx.deleteMessage();
    // console.log('event detail id:', id);
    if (!ctx.session) {
        console.log('session is empty.')
        return;
    }
    let eventList: IEvent[] | undefined = ctx.session.selectedEventList;
    // console.log('session中的eventList length:', eventList.length);

    if (!eventList || eventList.length == 0) {
        ctx.reply('event list is empty.')
        return;
    }
    let event: IEvent | undefined;
    eventList.forEach(element => {
        if (element.id === id) {
            event = element;
        }
    })
    if (!event) {
        ctx.reply('🥲can not find event.')
        return;
    }

    // console.log("当前选中的事件是：",event);

    let eventDetailMsg = '';

    eventDetailMsg += `*Event details: *\n`;
    eventDetailMsg += `\n• Title: *${formatString(event.title)} 📈*\n`
    eventDetailMsg += `• Bet: ${formatString(formatVolume(event.volume))}`;
    eventDetailMsg += `\n• volume24hr: ${formatString(formatVolume(event.volume24hr))}`;
    eventDetailMsg += `\n• commentCount: ${event.commentCount}\n\n`;
    let currentMarketList: IMarket[] = event.markets;
    if(!currentMarketList || currentMarketList.length == 0) {
        ctx.reply('🥲current event has zero market.')
        return;
    }
    if (currentMarketList && currentMarketList.length > 1) {
        sortMarket(currentMarketList);
        let maxLength = currentMarketList.length > 3 ? 3 : currentMarketList.length;
        for (let j = 0; j < maxLength; j++) {//只需要列出前3个
            let market = currentMarketList[j];
            let url = getOperationUrl(event, market);
            eventDetailMsg += `*${(j + 1) + '\\. ' + formatString(market.groupItemTitle)}*    ${Math.round(market.bestAsk * 100)}%      [\\[Yes\\]](${url + '_0'})       [\\[No\\]](${url + '_1'})\n\n`;
        }
    } else {
        let url = getOperationUrl(event, currentMarketList[0]);
        eventDetailMsg += `[\\[Yes\\]](${url+'_0'})      [\\[No\\]](${url+'_1'})`;
    }
    eventDetailMsg += `\n`;

    let buttons = getEventDetailMenu();
    ctx.replyWithMarkdownV2(eventDetailMsg as string, { reply_markup: { inline_keyboard: buttons }, disable_web_page_preview: true } as ExtraReplyMessage);
}

function getOperationUrl(event: IEvent, market: IMarket) {
    if(!market) {
        return;
    }
    let url = `https://t.me/polymarket_kbot?start=edo-${event.id + '_' + market.id}`
    return url;
}

function getEventDetailMenu() {
    const buttons = [[
        Markup.button.callback('× Dismiss Message', WELCOME_DISMISS_GENERATE_WALLET)
    ]];
    return buttons;
}