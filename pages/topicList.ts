import axios from "axios";
import { Context, Markup, Telegraf } from "telegraf";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import 'dotenv/config';
import { MARKETS_BACK_TO_CATEGORY, MARKETS_TOPIC_PREFIX } from "../utils/constant";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { ICategory, updateMarket } from "./markets";
import { showEvent } from "./eventList";


export async function showTopics(bot: Telegraf, ctx: Context, categoryLabel: string, categorySlug: string) {
    var topicMessage = `*Markets:*\nYou have selected category: *${categorySlug.replace('-', '\\-')}*\nPlease select your interested topic: `;
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
        console.log('error:',error);
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

async function getTopicsApi(categorySlug: string) {
    const market = await axios.get(`https://polymarket.com/api/tags/filteredBySlug?tag=${categorySlug}&status=active`);
    // console.log(`getTopicsApi: `, market.data);
    return market.data as ICategory[];
}