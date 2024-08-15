import { Context, Telegraf, Markup } from "telegraf";
import { Side, OrderType } from "@polymarket/clob-client";
import { MARKETS_ORDER_OP_BUY, MARKETS_ORDER_OP_SELL, MARKETS_ORDER_OP_MARKET, MARKETS_ORDER_OP_LIMIT } from "../utils/constant";
import { ExtraEditMessageText, ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { IEvent, IMarket } from "./eventList";
import { MyContext } from "../index";
import { initClobClientGnosis } from "../clobclientInit";

/**
 * 首先选择买或者卖
 * @param ctx 
 * @param params 
 */
export function showOrderBuyAndSellButton(bot: Telegraf, ctx: MyContext, params: string) {
    //删除/start消息
    ctx.deleteMessage();  // 删除当前的消息

    let paramsArray = params.split('_', 3);
    let eventId = paramsArray[0];
    let marketId = paramsArray[1];
    let yesOrNo = paramsArray[2];

    let eventList: IEvent[] | undefined = ctx.session?.selectedEventList;
    if (!eventList || eventList.length == 0) {
        return;
    }
    // console.log('session中的eventList length:', eventList.length);
    let event: IEvent | undefined;
    let market: IMarket | undefined;
    eventList.forEach(element => {
        if (element.id === eventId) {
            event = element;
            element.markets.forEach(ele => {
                if (ele.id === marketId) {
                    market = ele;
                }
            })
        }
    })

    if (!event || !market) {
        return;
    }

    //save variable to session
    ctx.session!.selectedEvent = event;
    ctx.session!.selectedMarket = market;
    ctx.session!.selectedYesOrNo = yesOrNo;
    ctx.session!.selectedBuyOrSell = undefined;


    let yesOrNoStr = '';
    if (yesOrNo === '0') {
        //buy
        yesOrNoStr = 'Yes';
    } else {
        //sell
        yesOrNoStr = 'No';
    }
    let orderActionMsg = '';
    if (event.markets.length > 1) {
        orderActionMsg += `You have select *${market.groupItemTitle}\\-${yesOrNoStr}*\\. `;
    } else {
        orderActionMsg += `You have select *${yesOrNoStr}*\\.`;
    }
    console.log("eventId:", eventId, ',marketId:', marketId, ',YesOrNo:', yesOrNo)
    orderActionMsg += `Please select action: `;

    ctx.replyWithMarkdownV2(orderActionMsg as string, { reply_markup: { inline_keyboard: getOrderOpMenu() }, disable_web_page_preview: true } as ExtraReplyMessage);
}


/**
 * 其次选择订单类型，市价单或者限价单
 * @param ctx 
 * @param params 
 */
export function showMarketOrLimitButton(bot: Telegraf, ctx: MyContext, buyOrSell: string) {
    ctx.session!.selectedBuyOrSell = buyOrSell;
    let selectedMarket = ctx.session?.selectedMarket;
    let selectedYesOrNo = ctx.session?.selectedYesOrNo;
    let groupItemTitle = selectedMarket?.groupItemTitle;

    let orderTypeMsg = '';
    let tempMsg = '';
    if (groupItemTitle && groupItemTitle.length > 0) {
        tempMsg += `${groupItemTitle}\\-`
    }
    if (selectedYesOrNo === '0') {
        tempMsg += `Yes\\-`;
    } else {
        tempMsg += `No\\-`;
    }
    if (buyOrSell === '0') {
        tempMsg += 'Buy';
    } else {
        tempMsg += 'Sell';
    }
    orderTypeMsg = `You have select *${tempMsg}*, Please select order type: \n`;
    ctx.editMessageText(
        orderTypeMsg as string,
        {
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: getOrderTypeMenu()
            }
        } as ExtraEditMessageText
    ).catch((error) => {
        console.log('error:', error);
    })
    // ctx.replyWithMarkdownV2(orderTypeMsg as string, { reply_markup: { inline_keyboard: getOrderTypeMenu() }, disable_web_page_preview: true } as ExtraReplyMessage);
}



function getOrderOpMenu() {
    return [[
        Markup.button.callback('Buy', MARKETS_ORDER_OP_BUY),
        Markup.button.callback('Sell', MARKETS_ORDER_OP_SELL)
    ]]
}


function getOrderTypeMenu() {
    return [[
        Markup.button.callback('Market', MARKETS_ORDER_OP_MARKET),
        Markup.button.callback('Limit', MARKETS_ORDER_OP_LIMIT),
    ]]
}


export function createOrder(ctx: MyContext, isMarketOrder: boolean) {
    let selectedEvent = ctx.session?.selectedEvent;
    let selectedMarket = ctx.session?.selectedMarket;
    let selectedYesOrNo = ctx.session?.selectedYesOrNo;
    let selectedBuyOrSell = ctx.session?.selectedBuyOrSell;
    ctx.reply("点击了" + (isMarketOrder ? '市价单' : '限价单') + '选中:' + selectedEvent?.id + "," + 
selectedMarket?.id + "," + selectedYesOrNo + ',' + selectedBuyOrSell);
}




async function createBuyLimitOrder(ctx: Context, tokenID: string, amount: number, price: number) {
    const clobClient = await initClobClientGnosis(ctx.from!.id.toString());
    if (!clobClient) {
        return;
    }
    const order = await clobClient.createOrder({
        tokenID:
            `${tokenID}`,//67651190137384692436254313465446414883079283131079052933923486306417976524160
        price: price,//0.08
        side: Side.BUY,
        size: amount,//20
        feeRateBps: 0,
        nonce: 0,
    });
    // console.log("Created Order", order);

    // GTC Order
    const resp = await clobClient.postOrder(order, OrderType.GTC);
    console.log('createBuyLimitOrder:', resp);
}

async function createBuyMarketOrder(ctx: Context, tokenID: string) {
    const clobClient = await initClobClientGnosis(ctx.from!.id.toString());
    if (!clobClient) {
        return;
    }
    const marketOrder = await clobClient.createMarketBuyOrder({
        tokenID: `${tokenID}`,//67651190137384692436254313465446414883079283131079052933923486306417976524160
        amount: 20,
        feeRateBps: 0,
        nonce: 0,
    });
    // console.log("Created Order", marketOrder);

    // FOK Order
    const resp = await clobClient.postOrder(marketOrder, OrderType.FOK);
    console.log('createBuyMarketOrder:', resp);
}

async function createSellLimitOrder(ctx: Context, tokenID: string, amount: number, price: number) {
    const clobClient = await initClobClientGnosis(ctx.from!.id.toString());
    if (!clobClient) {
        return;
    }
    const order = await clobClient.createOrder({
        tokenID: `${tokenID}`,
        price: price,
        side: Side.SELL,
        size: amount,
        feeRateBps: 0,
        nonce: 0,
    });
    // console.log("Created Order", order);
    // GTC Order
    const resp = await clobClient.postOrder(order, OrderType.GTC);
    console.log(resp);
}

async function createSellMarketOrder(ctx: Context, tokenID: string, amount: number) {
    const clobClient = await initClobClientGnosis(ctx.from!.id.toString());
    if (!clobClient) {
        return;
    }
    const order = await clobClient.createOrder({
        tokenID: `${tokenID}`,
        price: 0.51,
        side: Side.SELL,
        size: amount,
        feeRateBps: 0,
        nonce: 0,
    });
    // console.log("Created Order", order);
    // GTC Order
    const resp = await clobClient.postOrder(order, OrderType.GTC);
    console.log(resp);
}

