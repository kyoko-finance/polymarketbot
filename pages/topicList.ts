import axios from "axios";
import { Context, Markup, Telegraf } from "telegraf";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import 'dotenv/config';
import { MARKETS_BACK_TO_CATEGORY, MARKETS_TOPIC_PREFIX } from "../utils/constant";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { ICategory, updateMarket } from "./markets";
import { showEvent } from "./eventList";
import { formatString } from "../utils/utils";


export async function showTopics(bot: Telegraf, ctx: Context, categoryLabel: string, categorySlug: string) {
    var topicMessage = `*Markets:*\nYou have selected category: *${formatString(categorySlug)}*\nPlease select your interested topic: `;
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
    if(categorySlug === 'new') {
        //new下的topic分类和all分类下的一样
        categorySlug = 'all';
    }
    const topics = await axios.get(`https://polymarket.com/api/tags/filteredBySlug?tag=${categorySlug}&status=active`);
    // console.log(`getTopicsApi: `, topics.data);
    let topicList: ICategory[] = topics.data;
    if(!topicList || topicList.length == 0) {
        return topicList;
    }
    //每个分类下都有一个Top,在第一个位置
    let topTopic = {
        id: '',
        label: 'Top',
        slug: 'top'
    }
    topicList.splice(0, 0, topTopic);
    //每个分类下都有一个New,在第二个位置
    let newTopic = {
        id: '',
        label: 'New',
        slug: 'new'
    }
    topicList.splice(1, 0, newTopic);
    return topicList as ICategory[];
}