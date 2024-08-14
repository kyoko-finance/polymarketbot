import { Context, Telegraf, Markup } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { MARKETS_BACK_TO_TOPIC } from "../utils/constant";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import { formatVolume } from "../utils/utils";
import axios from "axios";
import { showTopics } from "./topicList";



export async function showEvent(bot: Telegraf, ctx: Context, topicLabel: string, topicSlug: string, categoryLabel: string, categorySlug: string) {
    var eventList: IEvent[] = await getEventApi(topicSlug);
    if (!eventList || eventList.length == 0) {
        ctx.reply("No available event.")
        return;
    }
    var eventMessage = getEventShowMsg(ctx, eventList, categoryLabel, topicLabel);
    // console.log('******************')
    // console.log(eventMessage);
    // console.log('******************')
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
        console.log(error);
    })
}

function getEventShowMsg(ctx: Context, eventList: IEvent[], categoryLabel: string, topicLabel: string) {
    var eventMessage = `*Markets:*\n*${categoryLabel}*\\-*${topicLabel}*\n`;
    if (!eventList || eventList.length == 0) {
        return eventMessage + "\nNo open orders data";
    }
    for (var i = 0; i < eventList.length; i++) {
        let element = eventList[i];

        var cancelOrderUrl = `https://t.me/polymarket_kbot?start=co-${element.id.substring(2).slice(0, -5)}`
        // console.log('cancelOrderUrl:', cancelOrderUrl);

        eventMessage += `\n• Title: *${element.title.replace(/\./g, '\\.').replace(/\-/g, '\\.')} 📈*\n`
        let currentMarketList: IMarket[] = element.markets;
        sortMarket(currentMarketList);
        let maxLength = currentMarketList.length > 3 ? 3 : currentMarketList.length;
        for (let j = 0; j < maxLength; j++) {//只需要列出前3个
            let market = currentMarketList[j];
            eventMessage += `   *${(j+1) + '\\.' +market.groupItemTitle.replace(/\./g, '\\.').replace(/\-/g, '\\.')}*    ${Math.round(market.bestAsk * 100)}%    Yes  No\n`;
        }
        eventMessage += `• Bet: ${formatVolume(element.volume).replace('.', '\\.')}`;
        eventMessage += `\n• volume24hr: ${formatVolume(element.volume24hr).replace('.', '\\.')}`
        eventMessage += `\n• commentCount: ${element.commentCount}`
        eventMessage += `\n• Operation: [\\[Operation\\]](${cancelOrderUrl})`
        if(i !== eventList.length - 1) {
            eventMessage += `\n\n──────────────────────`;
        }
        eventMessage += `\n`;
    }
    return eventMessage;
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
    console.log("selected topicSlug:", topicSlug);
    var resp = await axios.get(`https://gamma-api.polymarket.com/events?limit=10&active=true&archived=false&tag_slug=${topicSlug}&closed=false&order=volume24hr&ascending=false&offset=0`);
    var eventList: IEvent[] = resp.data;// console.log(`getEventApi: `, eventList);
    return eventList;
}

/**
 * 对marketList按照bestAsk降序排列，如果相等则按照volume降序排列
 * @param marketList 
 */
function sortMarket(marketList: IMarket[]) {
    marketList.sort((a, b) => {
        if (b.bestAsk !== a.bestAsk) {
            return b.bestAsk - a.bestAsk;
        }
        return parseFloat(b.volume) - parseFloat(a.volume);
    })
}


interface IEvent {
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

interface IMarket {
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