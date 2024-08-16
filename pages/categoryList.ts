import axios from "axios";
import { Context, Markup, Telegraf } from "telegraf";
import { ExtraEditMessageText, ExtraReplyMessage } from "telegraf/typings/telegram-types";
import 'dotenv/config';
import { BACK_TO_INDEX, MARKETS_CATEGORY_PREFIX } from "../utils/constant";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { MyContext } from "..";


export async function showCategoryList(bot: Telegraf, ctx: Context) {
    let marketMessage = `*Markets:*\nPlease select your interested category: `;
    let categoryList = await getCategoryApi(ctx);
    if (!categoryList || categoryList.length == 0) {
        ctx.reply("No available category.")
        return;
    }
    var buttons = getCategoryMenu(categoryList);
    ctx.replyWithMarkdownV2(marketMessage as string, { reply_markup: { inline_keyboard: buttons }, disable_web_page_preview: true } as ExtraReplyMessage);
}

export async function updateCategoryList(ctx: Context) {
    var marketMessage = `*Markets:*\nPlease select your interested category: `;
    let categoryList = await getCategoryApi(ctx);
    if (!categoryList || categoryList.length == 0) {
        ctx.reply("No available category.")
        return;
    }
    var buttons = getCategoryMenu(categoryList);
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


async function getCategoryApi(ctx: MyContext) {
    try {
        const category = await axios.get('https://polymarket.com/api/tags/filtered?tag=100221&status=active');
        // console.log(`getCategory:`, category.data);
        //add a 'New' category to position 1
        let list: ICategory[] = category.data;
        if(category.data == null || category.data.length == 0) {
            return list;
        }
        let newCategory: ICategory = {
            id: '',
            label: 'New',
            slug: 'new'
        }
        list.splice(1, 0, newCategory);
        //save category list
        ctx.session!.categoryList = list;
        return list;
    } catch (error) {
        console.log(error);
        return [];
    }
}




function getCategoryMenu(categoryList: ICategory[]): InlineKeyboardButton[][] {
    const result: InlineKeyboardButton[][] = [];
    for (let i = 0; i < categoryList.length; i += 3) {
        let chunk = categoryList.slice(i, i + 3);
        let line: InlineKeyboardButton[] = [];
        for(let j = 0; j < chunk.length; j++) {
            let serial = i + j;
            // console.log('序号：', serial);
            var button = Markup.button.callback(chunk[j].label, (MARKETS_CATEGORY_PREFIX + serial));
            line.push(button);
        }
        result.push(line);
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








