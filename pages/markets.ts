import axios from "axios";
import { Context, Markup, Telegraf } from "telegraf";
import { ExtraEditMessageText, ExtraReplyMessage } from "telegraf/typings/telegram-types";
import 'dotenv/config';
import { BACK_TO_INDEX, MARKETS_CATEGORY_PREFIX } from "../utils/constant";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { showTopics } from "./topicList";

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
    // console.log(`getCategory:`, category.data);
    return category.data as ICategory[];
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








