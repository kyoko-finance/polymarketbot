import { Context, Telegraf, Markup, session } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { MARKETS_BACK_TO_TOPIC } from "../utils/constant";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import { formatVolume, sortMarket } from "../utils/utils";
import axios from "axios";
import { showTopics } from "./topicList";
import { MyContext } from "../index";



export async function showEvent(bot: Telegraf, ctx: MyContext, topicLabel: string, topicSlug: string, categoryLabel: string, categorySlug: string) {
    var eventList: IEvent[] = await getEventApi(topicSlug);
    if (!eventList || eventList.length == 0) {
        ctx.reply("No available event.")
        return;
    }
    var eventMessage = getEventShowMsg(ctx, eventList, categoryLabel, topicLabel);
    eventActions(bot, categoryLabel, categorySlug);
    ctx.editMessageText(
        eventMessage as string,
        {
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: getEventMenu()
            }
        } as ExtraEditMessageText
    ).catch((error) => {
        console.log('error:', error);
    })
}

function getEventShowMsg(ctx: MyContext, eventList: IEvent[], categoryLabel: string, topicLabel: string) {
    console.log("打印session:", ctx.session);
    var eventMessage = `*Markets:*\n*${categoryLabel}*\\-*${topicLabel}*\n`;

    // ctx.session ??= { selectedEventList: [], messageCount: 0 };
    ctx.session.selectedEventList = eventList;


    if (!eventList || eventList.length == 0) {
        return eventMessage + "\nNo open orders data";
    }
    for (var i = 0; i < eventList.length; i++) {
        let element = eventList[i];

        if(i == 0) {
            // console.log(element);
            console.log('第一个的id是：', element.id, ",", element.title);
        }

        //ed表示event detail
        var cancelOrderUrl = `https://t.me/polymarket_kbot?start=ed-${element.id}`
    

        eventMessage += `\n• Title: *${element.title.replace(/\./g, '\\.').replace(/\-/g, '\\.')} 📈*\n`
        let currentMarketList: IMarket[] = element.markets;
        if (!currentMarketList || currentMarketList.length == 0) {
            continue;
        }
        if (currentMarketList.length > 1) {
            sortMarket(currentMarketList);
            let maxLength = currentMarketList.length > 3 ? 3 : currentMarketList.length;
            for (let j = 0; j < maxLength; j++) {//只需要列出前3个
                let market = currentMarketList[j];
                eventMessage += `   *${(j + 1) + '\\.' + market.groupItemTitle.replace(/\./g, '\\.').replace(/\-/g, '\\.')}*    ${Math.round(market.bestAsk * 100)}%    Yes  No\n`;
            }
        }

        var volumeStr = element.volume ? formatVolume(element.volume).replace('.', '\\.') : '-';
        var volume24hrStr = element.volume24hr ? formatVolume(element.volume24hr).replace('.', '\\.') : '-';

        eventMessage += `• Bet: ${volumeStr}`;
        eventMessage += `\n• volume24hr: ${volume24hrStr}`
        eventMessage += `\n• commentCount: ${element.commentCount}`
        eventMessage += `\n• Operation: [\\[Operation\\]](${cancelOrderUrl})`
        if (i !== eventList.length - 1) {
            eventMessage += `\n\n──────────────────────`;
        }
        eventMessage += `\n`;
    }
    return eventMessage.replace(/\+/g, '\\.');
}

function eventActions(bot: Telegraf, categoryLabel: string, categorySlug: string) {
    bot.action(MARKETS_BACK_TO_TOPIC, async (ctx: Context) => {
        showTopics(bot, ctx, categoryLabel, categorySlug);
    })
}



function getEventMenu(): InlineKeyboardButton[][] {
    return [[
        Markup.button.callback('↩︎ Back', MARKETS_BACK_TO_TOPIC),
    ]]
}

async function getEventApi(topicSlug: string) {
    var resp = await axios.get(`https://gamma-api.polymarket.com/events?limit=10&active=true&archived=false&tag_slug=${topicSlug}&closed=false&order=volume24hr&ascending=false&offset=0`);
    var eventList: IEvent[] = resp.data;
    return eventList;
}


export interface IEvent {
    id: string;
    ticker: string;
    slug: string;
    title: string;
    description: string;
    image: string;
    icon: string;
    volume: number;
    volume24hr: number;
    liquidityClob: number;
    commentCount: number;
    markets: IMarket[];
}

export interface IMarket {
    id: string;
    question: string;
    groupItemTitle: string;
    conditionId: string;
    slug: string;
    liquidity: string;
    image: string;
    icon: string;
    outcomes: string;
    volume: string;
    volumeNum: number;
    liquidityNum: number;
    orderMinSize: string;
    volume24hr: string;
    clobTokenIds: string;
    spread: number;
    oneDayPriceChange: number;
    lastTradePrice: number;
    bestBid: number;
    bestAsk: number;
}