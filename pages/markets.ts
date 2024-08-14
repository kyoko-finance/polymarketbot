import axios from "axios";
import { Context, Markup, Telegraf } from "telegraf";
import { ExtraEditMessageText, ExtraReplyMessage } from "telegraf/typings/telegram-types";
import 'dotenv/config';
import { BACK_TO_INDEX, MARKETS_BACK_TO_CATEGORY, MARKETS_BACK_TO_TOPIC, MARKETS_CATEGORY_PREFIX, MARKETS_TOPIC_PREFIX } from "../utils/constant";
import { queryUserInfo } from "../utils/db";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { MyContext } from '../index';
import { BigNumber } from "ethers";
import { formatVolume } from "../utils/utils";

var categoryList: ICategory[];

export async function showMarket(bot: Telegraf, ctx: Context) {
    var marketMessage = `*Markets:*\nPlease select your interested category:`;
    categoryList = await getCategoryApi();
    if (!categoryList || categoryList.length == 0) {
        ctx.reply("No available category.")
        return;
    }
    var buttons = getCategoryMenu(categoryList);
    categoryActions(bot, categoryList);
    ctx.replyWithMarkdownV2(marketMessage as string, { reply_markup: { inline_keyboard: buttons }, disable_web_page_preview: true } as ExtraReplyMessage);
}


async function getCategoryApi() {
    const category = await axios.get('https://polymarket.com/api/tags/filtered?tag=100221&status=active');
    console.log(`getCategory:`, category.data);
    return category.data as ICategory[];
}

async function getTopicsApi(categorySlug: string) {
    const market = await axios.get(`https://polymarket.com/api/tags/filteredBySlug?tag=${categorySlug}&status=active`);
    console.log(`getTopicsApi: `, market.data);
    return market.data as ICategory[];
}


function getCategoryMenu(categoryList: ICategory[]): InlineKeyboardButton[][] {
    const result: InlineKeyboardButton[][] = [];
    for (let i = 0; i < categoryList.length; i += 3) {
        const chunk = categoryList.slice(i, i + 3).map(category =>
            Markup.button.callback(category.label, MARKETS_CATEGORY_PREFIX + category.slug)
        )
        result.push(chunk);
    }
    result.push([
        Markup.button.callback('↩︎ Back', BACK_TO_INDEX),
    ])
    return result;
}

export interface ICategory {
    id: string;
    label: string;
    slug: string;
}


function categoryActions(bot: Telegraf, categoryList: ICategory[]) {
    for (var i = 0; i < categoryList.length; i++) {
        let category = categoryList[i];
        bot.action(MARKETS_CATEGORY_PREFIX + category.slug, async (ctx: Context) => {
            // go to topic list
            console.log(category.slug);
            showTopics(bot, ctx, category.label, category.slug);
        });
    }
}

export async function showTopics(bot: Telegraf, ctx: Context, categoryLabel: string, categorySlug: string) {
    var topicMessage = `*Markets:*\nYou have selected category:*${categorySlug.replace('-', '\\-')}*\nPlease select your interested topic:`;
    var toplicsList: ICategory[] = await getTopicsApi(categorySlug);
    if (!toplicsList || toplicsList.length == 0) {
        ctx.reply("No available topic.")
        return;
    }
    topicActions(bot, toplicsList, categoryLabel, categorySlug);
    ctx.editMessageText(
        topicMessage as string,
        {
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: getTopicMenu(toplicsList)
            }
        } as ExtraEditMessageText
    ).catch((error) => {
        console.log(error);
    })
}


function getTopicMenu(topicsList: ICategory[]): InlineKeyboardButton[][] {
    const result: InlineKeyboardButton[][] = [];
    for (let i = 0; i < topicsList.length; i += 2) {
        const chunk = topicsList.slice(i, i + 2).map(topic =>
            Markup.button.callback(topic.label, MARKETS_TOPIC_PREFIX + topic.slug)
        )
        result.push(chunk);
    }
    result.push([
        Markup.button.callback('↩︎ Back', MARKETS_BACK_TO_CATEGORY),
    ])
    return result;
}

function topicActions(bot: Telegraf, toplicsList: ICategory[], categoryLabel: string, categorySlug: string) {
    for (var i = 0; i < toplicsList.length; i++) {
        let topic = toplicsList[i];
        bot.action(MARKETS_TOPIC_PREFIX + topic.slug, async (ctx: Context) => {
            showEvent(bot, ctx, topic.label, topic.slug, categoryLabel, categorySlug);
        });
    }
    bot.action(MARKETS_BACK_TO_CATEGORY, async (ctx: Context) => {
        updateMarket(bot, ctx);
    })
}

function eventActions(bot: Telegraf, categoryLabel: string, categorySlug: string) {
    bot.action(MARKETS_BACK_TO_TOPIC, async (ctx: Context) => {
        showTopics(bot, ctx, categoryLabel, categorySlug);
    })
}

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


export async function updateMarket(bot: Telegraf, ctx: Context) {
    var marketMessage = `*Markets:*\nPlease select your interested category:`;
    if (!categoryList || categoryList.length == 0) {
        ctx.reply("No available category.")
        return;
    }
    var buttons = getCategoryMenu(categoryList);
    categoryActions(bot, categoryList);
    ctx.editMessageText(
        marketMessage as string,
        {
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: buttons
            }
        } as ExtraEditMessageText
    ).catch((error) => {
        console.log(error);
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






