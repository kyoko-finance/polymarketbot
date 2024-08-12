import { Telegraf, session, Scenes, Context } from 'telegraf';
import { showIndex } from './index';
import 'dotenv/config';
import {
    WELCOME_DISMISS_GENERATE_WALLET, INDEX_PAGE_MARKETS, INDEX_PAGE_POSITIONS,
    INDEX_PAGE_OPEN_ORDERS, INDEX_PAGE_HISTORY, INDEX_PAGE_PROFILE,
    INDEX_PAGE_DISMISS,  PROFILE_REFRESH_ASSETS, BACK_TO_INDEX
} from "../utils/constant";
import { showProfile, updateProfile } from './profile';
import { showHistory } from './history';
import { showOpenOrders } from './openOrders';



export function actions(bot: Telegraf) {
    indexActions(bot);
    profileActions(bot);
}

function indexActions(bot: Telegraf) {
    bot.action(WELCOME_DISMISS_GENERATE_WALLET, async (ctx: Context) => {
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
    });
    bot.action(INDEX_PAGE_MARKETS, async (ctx: Context) => {
        ctx.reply("click markets")
    });
    bot.action(INDEX_PAGE_POSITIONS, async (ctx: Context) => {
        ctx.reply("click positions")
    });
    bot.action(INDEX_PAGE_OPEN_ORDERS, async (ctx: Context) => {
        showOpenOrders(ctx);
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
    });
    bot.action(INDEX_PAGE_HISTORY, async (ctx: Context) => {
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
        showHistory(ctx);
    });
    bot.action(INDEX_PAGE_PROFILE, async (ctx: Context) => {
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
        showProfile(ctx);
    });
    bot.action(INDEX_PAGE_DISMISS, async (ctx: Context) => {
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
    });
}

function profileActions(bot: Telegraf) {
    bot.action(PROFILE_REFRESH_ASSETS, async (ctx: Context) => {
        updateProfile(ctx);
    });
    bot.action(BACK_TO_INDEX, async (ctx: Context) => {
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
        showIndex(ctx);
    });
}
