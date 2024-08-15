import { Telegraf, session, Scenes, Context } from 'telegraf';
import { showIndex } from './index';
import 'dotenv/config';
import {
    WELCOME_DISMISS_GENERATE_WALLET, INDEX_PAGE_MARKETS, INDEX_PAGE_POSITIONS,
    INDEX_PAGE_OPEN_ORDERS, INDEX_PAGE_HISTORY, INDEX_PAGE_PROFILE,
    INDEX_PAGE_DISMISS, PROFILE_REFRESH_ASSETS, BACK_TO_INDEX,
    OPEN_ORDERS_REFRESH, OPEN_ORDERS_BACK_TO_INDEX,
    MARKETS_ORDER_OP_BUY,
    MARKETS_ORDER_OP_SELL,
    MARKETS_ORDER_OP_MARKET,
    MARKETS_ORDER_OP_LIMIT
} from "../utils/constant";
import { showProfile, updateProfile } from './profile';
import { showHistory } from './history';
import { showOpenOrders, updateOpenOrders, deleteOpenOrderMap } from './openOrders';
import { showPositions } from './positions';
import { showMarket } from './markets';
import { createOrder, showMarketOrLimitButton } from './Order';



export function actions(bot: Telegraf) {
    bot.action(BACK_TO_INDEX, async (ctx: Context) => {
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
        showIndex(ctx);
    });
    indexActions(bot);
    profileActions(bot);
    openOrdersActions(bot);
    orderBuyAndSellActions(bot);
    orderMarketOrLimitActions(bot);
}

function indexActions(bot: Telegraf) {
    bot.action(WELCOME_DISMISS_GENERATE_WALLET, async (ctx: Context) => {
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
    });
    bot.action(INDEX_PAGE_MARKETS, async (ctx: Context) => {
        showMarket(bot, ctx);
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）

    });
    bot.action(INDEX_PAGE_POSITIONS, async (ctx: Context) => {
        showPositions(ctx);
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
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
}

function openOrdersActions(bot: Telegraf) {
    bot.action(OPEN_ORDERS_REFRESH, async (ctx: Context) => {
        updateOpenOrders(ctx);
    });
    bot.action(OPEN_ORDERS_BACK_TO_INDEX, async (ctx: Context) => {
        try {
            ctx.deleteMessage();  // 删除当前的消息
            ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
            deleteOpenOrderMap(ctx.from!.id.toString());
        } catch (error) {
        }
    });
}


function orderBuyAndSellActions(bot: Telegraf) {
    bot.action(MARKETS_ORDER_OP_BUY, async (ctx: Context) => {
        showMarketOrLimitButton(bot, ctx, '0');
    });
    bot.action(MARKETS_ORDER_OP_SELL, async (ctx: Context) => {
        showMarketOrLimitButton(bot, ctx, '1');
    });
}

function orderMarketOrLimitActions(bot: Telegraf) {
    bot.action(MARKETS_ORDER_OP_MARKET, async (ctx: Context) => {
        // + event.id + "," + market.id + ",YesOrNo:" +  yesOrNo + ",buyOrSell:" + buyOrSell
        createOrder(ctx, true);
    });
    bot.action(MARKETS_ORDER_OP_LIMIT, async (ctx: Context) => {
        // + event.id + "," + market.id + ",YesOrNo:" + yesOrNo + ",buyOrSell:" + buyOrSell
        createOrder(ctx, false);
    });
}
