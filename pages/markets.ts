import axios from "axios";
import { Context, Markup, Telegraf } from "telegraf";
import { ExtraEditMessageText, ExtraReplyMessage } from "telegraf/typings/telegram-types";
import 'dotenv/config';
import { BACK_TO_INDEX, MARKETS_BACK_TO_CATEGORY, MARKETS_CATEGORY_PREFIX, MARKETS_TOPIC_PREFIX } from "../utils/constant";
import { queryUserInfo } from "../utils/db";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { MyContext } from '../index';

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
    // console.log(result)
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
            // ctx.reply(MARKETS_CATEGORY_PREFIX + category.slug)
            let topicsList = await getTopicsApi(category.slug);
            showTopics(bot, ctx, category.slug);
        });
    }

}

export async function showTopics(bot: Telegraf, ctx: Context, categorySlug: string) {
    var topicMessage = `*Markets:*\nYou have selected category:*${categorySlug}*\nPlease select your interested topic:`;
    var toplicsList: ICategory[] = await getTopicsApi(categorySlug);
    if (!toplicsList || toplicsList.length == 0) {
        ctx.reply("No available topic.")
        return;
    }
    var buttons = getTopicMenu(toplicsList);
    topicActions(bot, toplicsList);
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
    // ctx.replyWithMarkdownV2(marketMessage as string, { reply_markup: { inline_keyboard: buttons }, disable_web_page_preview: true } as ExtraReplyMessage);
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
    // console.log(result)
    return result;
}

function topicActions(bot: Telegraf, toplicsList: ICategory[]) {
    for (var i = 0; i < toplicsList.length; i++) {
        let topic = toplicsList[i];
        bot.action(MARKETS_TOPIC_PREFIX + topic.slug, async (ctx: Context) => {
            // show event list
            // console.log(category.slug);
            ctx.reply(MARKETS_TOPIC_PREFIX + topic.slug);
            // let topicsList = await getTopicsApi(category.slug);
            // showTopics(bot, ctx, category.slug);
        });
    }
    bot.action(MARKETS_BACK_TO_CATEGORY, async (ctx: Context) => {
        updateMarket(bot, ctx);
    })

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






