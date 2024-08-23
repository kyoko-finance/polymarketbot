import { Telegraf, session, Scenes, Context } from 'telegraf';
import { showIndex } from '../botIndexPage';
import 'dotenv/config';
import {
    WELCOME_DISMISS_GENERATE_WALLET, INDEX_PAGE_MARKETS, INDEX_PAGE_POSITIONS,
    INDEX_PAGE_OPEN_ORDERS, INDEX_PAGE_HISTORY, INDEX_PAGE_PROFILE,
    INDEX_PAGE_DISMISS, PROFILE_REFRESH_ASSETS, BACK_TO_INDEX,
    OPEN_ORDERS_REFRESH, OPEN_ORDERS_BACK_TO_INDEX,
    MARKETS_ORDER_OP_BUY,
    MARKETS_ORDER_OP_SELL,
    MARKETS_ORDER_OP_MARKET,
    MARKETS_ORDER_OP_LIMIT,
    MARKETS_CATEGORY_PREFIX,
    MARKETS_BACK_TO_CATEGORY,
    MARKETS_BACK_TO_TOPIC,
    MARKETS_BACK_TO_INDEX,
    PROFILE_DEPOSIT,
    PROFILE_WITHDRAW
} from "../utils/constant";
import { showProfile, updateProfile } from '../user/profile/profile';
import { showHistory } from '../user/history';
import { showOpenOrders, updateOpenOrders, deleteOpenOrderMap } from '../user/openOrders';
import { showPositions } from '../user/positions';
import { showCategoryList, updateCategoryList } from '../event/categoryList';
import { showMarketOrLimitButton } from '../order/Order';
import { showTopicList } from '../event/topicList';
import { MyContext } from '../index';
import { showEventList } from '../event/eventList';
import { createOrder, showInputAmount } from '../order/createOrder';
import { deposit, handleDeposit } from '../user/profile/deposit';
import { handleWithdraw } from '../user/profile/withdraw';



export function actions(bot: Telegraf) {
    bot.action(BACK_TO_INDEX, async (ctx: Context) => {
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
        showIndex(ctx, undefined);
    });
    indexActions(bot);
    profileActions(bot);
    openOrdersActions(bot);
    orderBuyAndSellActions(bot);
    orderMarketOrLimitActions(bot);
    categoryListActions(bot);
    topicListActions(bot);
    eventListActions(bot);
}

function categoryListActions(bot: Telegraf) {
    bot.action(/markets_category_prefix_(\d+)/, ctx => {
        let itemId = ctx.match[1]; // 使用正则表达式捕获的 ID
        // ctx.reply(`你点击了第${parseInt(itemId)}个按钮`)
        // go to topic list
        let categoryList = (ctx as MyContext).session?.categoryList;
        if (categoryList == null || categoryList.length == 0) {
            ctx.reply('Category list is empty\\.');
            return;
        }
        let category = categoryList[parseInt(itemId)];
        console.log('当前选择了:', category.slug);
        (ctx as MyContext).session!.selectedCategory = category;
        showTopicList(ctx);
    });
    bot.action(MARKETS_BACK_TO_INDEX, (ctx: MyContext) => {
        //clear selectedCategory and topicList
        ctx.session!.categoryList = undefined;
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
        showIndex(ctx, undefined);
    });
}

//, toplicsList: ICategory[], categoryLabel: string, categorySlug: string
function topicListActions(bot: Telegraf) {
    bot.action(/markets_topic_prefix_(\d+)/, ctx => {

        let itemId = ctx.match[1]; // 使用正则表达式捕获的 ID
        // console.log("点击了Topic list中的一个:", itemId);
        // ctx.reply(`你点击了第${parseInt(itemId)}个按钮`)
        // go to event list
        let topicList = (ctx as MyContext).session?.topicList;
        if (topicList == null || topicList.length == 0) {
            ctx.reply('Topic list is empty.');
            return;
        }
        // let category = (ctx as MyContext).session!.selectedCategory;
        let topic = topicList[parseInt(itemId)];
        console.log('当前选择了:', topic.slug);
        (ctx as MyContext).session!.selectedTopic = topic;
        showEventList(ctx);
    });
    bot.action(MARKETS_BACK_TO_CATEGORY, async (ctx: MyContext) => {
        //clear selectedCategory and topicList
        ctx.session!.selectedCategory = undefined;
        ctx.session!.topicList = undefined;
        updateCategoryList(ctx);
    })
}

function eventListActions(bot: Telegraf) {
    //, categoryLabel: string, categorySlug: string
    bot.action(MARKETS_BACK_TO_TOPIC, async (ctx: MyContext) => {
        //clear selected topic
        ctx.session!.selectedTopic = undefined;
        showTopicList(ctx);
    })
}

function indexActions(bot: Telegraf) {
    bot.action(WELCOME_DISMISS_GENERATE_WALLET, async (ctx: Context) => {
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
    });
    bot.action(INDEX_PAGE_MARKETS, async (ctx: Context) => {
        showCategoryList(bot, ctx);
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
    bot.action(PROFILE_DEPOSIT, async (ctx: Context) => {
        handleDeposit(ctx);
    });
    bot.action(PROFILE_WITHDRAW, async (ctx: Context) => {
        handleWithdraw(ctx);
    });
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
        showMarketOrLimitButton(ctx, '0');
    });
    bot.action(MARKETS_ORDER_OP_SELL, async (ctx: Context) => {
        showMarketOrLimitButton(ctx, '1');
    });
}

function orderMarketOrLimitActions(bot: Telegraf) {
    bot.action(MARKETS_ORDER_OP_MARKET, async (ctx: Context) => {
        // + event.id + "," + market.id + ",YesOrNo:" +  yesOrNo + ",buyOrSell:" + buyOrSell
        // await createOrder(ctx, true, 100);
        // 获取按钮所在的消息ID
        const messageId = ctx.callbackQuery!.message!.message_id;
        showInputAmount(ctx, '0', messageId);
    });
    bot.action(MARKETS_ORDER_OP_LIMIT, async (ctx: Context) => {
        // + event.id + "," + market.id + ",YesOrNo:" + yesOrNo + ",buyOrSell:" + buyOrSell
        // await createOrder(ctx, false, 100);
        const messageId = ctx.callbackQuery!.message!.message_id;
        showInputAmount(ctx, '1', messageId)
    });
}
