import { Context, Telegraf, Markup, session } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { MARKETS_BACK_TO_TOPIC } from "../utils/constant";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import { formatString, formatVolume, sortMarket } from "../utils/utils";
import axios from "axios";
import { MyContext } from "../index";



export async function showEventList(ctx: MyContext) {
    let selectedCategory = ctx.session!.selectedCategory;
    let selectedTopic = ctx.session!.selectedTopic;
    if(!selectedCategory || !selectedTopic) {
        ctx.reply('Selected category/topic is empty\\.');
        return;
    }

    let categoryLabel = selectedCategory.label;
    let categorySlug = selectedCategory.slug;
    let topicLabel = selectedTopic.label;
    let topicSlug = selectedTopic.slug;

    let eventList: IEvent[] = await getEventApi(categorySlug, topicSlug);
    if (!eventList || eventList.length == 0) {
        ctx.reply("No available event.")
        return;
    }
    // console.log("******************")
    // console.log("事件列表中的第一个是：", eventList[0].markets);
    // console.log("******************")
    var eventMessage = getEventShowMsg(ctx, eventList, categoryLabel, topicLabel);
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
        // console.log('error:', error);
    })
}

function getEventShowMsg(ctx: MyContext, eventList: IEvent[], categoryLabel: string, topicLabel: string) {
    // console.log("打印session:", ctx.session);
    var eventMessage = `*Markets:*\n*${categoryLabel}*\\-*${topicLabel}*\n`;

    // ctx.session ??= { selectedEventList: [], messageCount: 0 };
    ctx.session!.selectedEventList = eventList;


    if (!eventList || eventList.length == 0) {
        return eventMessage + "\nNo open orders data";
    }
    for (var i = 0; i < eventList.length; i++) {
        let element = eventList[i];

        //ed表示event detail
        var cancelOrderUrl = `https://t.me/polymarket_kbot?start=ed-${element.id}`

        eventMessage += `\n• Title: *${formatString(element.title)} 📈*\n`
        let currentMarketList: IMarket[] = element.markets;
        if (!currentMarketList || currentMarketList.length == 0) {
            continue;
        }
        if (currentMarketList.length > 1) {
            sortMarket(currentMarketList);
            let maxLength = currentMarketList.length > 3 ? 3 : currentMarketList.length;
            for (let j = 0; j < maxLength; j++) {//只需要列出前3个
                let market = currentMarketList[j];
                eventMessage += `   *${(j + 1) + '\\. ' + formatString(market.groupItemTitle)}*    ${Math.round(market.bestAsk * 100)}%    Yes  No\n`;
            }
        }

        var volumeStr = element.volume ? formatString(formatVolume(element.volume)) : '-';
        var volume24hrStr = element.volume24hr ? formatString(formatVolume(element.volume24hr)) : '\\-';

        eventMessage += `• Bet: ${volumeStr}`;
        eventMessage += `\n• volume24hr: ${volume24hrStr}`
        eventMessage += `\n• commentCount: ${element.commentCount}`
        eventMessage += `\n• Operation: [\\[Operation\\]](${cancelOrderUrl})`
        if (i !== eventList.length - 1) {
            eventMessage += `\n\n──────────────────────`;
        }
        eventMessage += `\n`;
    }
    return eventMessage;//.replace(/\+/g, '\\+')
}



function getEventMenu(): InlineKeyboardButton[][] {
    return [[
        Markup.button.callback('↩︎ Back', MARKETS_BACK_TO_TOPIC),
    ]]
}

async function getEventApi(categorySlug: string, topicSlug: string) {
    var resp = await axios.get(getEventUrl(categorySlug, topicSlug));
    var eventList: IEvent[] = resp.data;
    // console.log('事件列表:', eventList);
    return eventList;
}

function getEventUrl(categorySlug: string, topicSlug: string) {
    let baseUrl = 'https://gamma-api.polymarket.com/events?limit=10&active=true&archived=false&closed=false&ascending=false&offset=0&';
    let url = `${baseUrl}tag_slug=${topicSlug}&order=volume24hr`;
    if(categorySlug === 'new' || categorySlug === 'all') {
        if(topicSlug === 'top') {
            url = `${baseUrl}order=volume24hr`;
        } else if(topicSlug === 'new') {
            url = `${baseUrl}order=startDate`;
        } else {
            if(categorySlug === 'all') {
                url = `${baseUrl}tag_slug=${topicSlug}&order=startDate`;
            } else {
                url = `${baseUrl}tag_slug=${topicSlug}&order=volume24hr`;
            }
            
        }
    }else if(topicSlug === 'new') {
        url = `${baseUrl}tag_slug=${categorySlug}&order=startDate`;
    } else if(topicSlug === 'top') {
        url = `${baseUrl}tag_slug=${categorySlug}&order=volume24hr`;
    }
    // console.log("categorySlug:" + categorySlug + ",topicSlug:" + topicSlug, ",url是：", url);
     return url;
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