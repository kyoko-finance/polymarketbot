import { Context, Telegraf, Markup } from "telegraf";
import { MARKETS_ORDER_OP_BUY, MARKETS_ORDER_OP_SELL, MARKETS_ORDER_OP_MARKET, MARKETS_ORDER_OP_LIMIT } from "../utils/constant";
import { ExtraEditMessageText, ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { IEvent, IMarket } from "./eventList";
import { MyContext } from "../index";
import { initClobClientGnosis } from "../clobclientInit";
import { BookParams } from "@polymarket/clob-client/dist/types";
import { formatString } from "../utils/utils";


/**
 * 首先选择买或者卖
 * @param ctx 
 * @param params 
 */
export async function showOrderBuyAndSellButton(ctx: MyContext, params: string) {
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
        orderActionMsg += `You have select *${market.groupItemTitle}\\-${yesOrNoStr}*\\.\n`;
    } else {
        orderActionMsg += `You have select *${yesOrNoStr}*\\.\n`;
    }
    //显示orderBook
    let orderBook = await getOrderBook(ctx.from!.id.toString(), JSON.parse(market.clobTokenIds) as string[]);
    let orderBookMsg = getOrderBookMsg(orderBook, yesOrNo);

    console.log("eventId:", eventId, ',marketId:', marketId, ',YesOrNo:', yesOrNo);
    orderActionMsg += orderBookMsg;
    orderActionMsg += `\nPlease select action: \n`;

    ctx.replyWithMarkdownV2(orderActionMsg as string, { reply_markup: { inline_keyboard: getOrderOpMenu() }, disable_web_page_preview: true } as ExtraReplyMessage);
}

function getOrderBookMsg(orderBookList: IOrderBook[], yesOrNo: string) {
    if (!orderBookList || orderBookList.length == 0) {
        return '';
    }
    let orderBook: IOrderBook;
    if (yesOrNo === '0') {//yes
        orderBook = orderBookList[0];
    } else {
        orderBook = orderBookList[1];
    }
    let asks = orderBook.asks.reverse().slice(0, 4).reverse();
    let bids = orderBook.bids.reverse().slice(0, 4);
    var message = '\n*ORDER BOOK*\n*PRICE*        *SHARES*        *TOTAL*\n';
    for (let i = 0; i < asks.length; i++) {
        let price = formatString((parseFloat(asks[i].price) * 100).toFixed(1));
        let shares = formatString(parseFloat(asks[i].size).toFixed(2))
        let total = formatString((parseFloat(asks[i].price) * parseFloat(asks[i].size)).toFixed(2));
        message += `${price}¢      ${shares}      $${total}\n`;
    }
    message += `\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\n`;
    for (let i = 0; i < bids.length; i++) {
        let price = formatString((parseFloat(bids[i].price) * 100).toFixed(1));
        let shares = formatString(parseFloat(bids[i].size).toFixed(2))
        let total = formatString((parseFloat(bids[i].price) * parseFloat(bids[i].size)).toFixed(2));
        message += `${price}¢      ${shares}      $${total}\n`;
    }
    return message;

}

async function getOrderBook(id: string, clobTokenIds: string[]) {
    try {
        if (!clobTokenIds || clobTokenIds.length != 2) {
            console.log('getOrderBook: tokenIds error');
            return [];
        }
        const clobClient = await initClobClientGnosis(id);
        if (!clobClient) {
            return [];
        }
        const YES = clobTokenIds[0];
        const NO = clobTokenIds[1];
        var orderBooks: IOrderBook[] = await clobClient.getOrderBooks([
            { token_id: YES },
            { token_id: NO },] as BookParams[]);
        console.log("getOrderBook:", orderBooks);
        return orderBooks;
    } catch {
        console.log("getOrderBook error")
        return [];
    }

}


export interface IOrderBook {
    market: string;
    asset_id: string;
    bids: IAskOrBid[];
    asks: IAskOrBid[];
    hash: string;
}

interface IAskOrBid {
    price: string;
    size: string;
}


/**
 * 其次选择订单类型，市价单或者限价单
 * @param ctx 
 * @param params 
 */
export async function showMarketOrLimitButton(ctx: MyContext, buyOrSell: string) {
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
    orderTypeMsg += `You have select *${tempMsg}*\\.\n`;
    //显示orderBook
    let orderBook = await getOrderBook(ctx.from!.id.toString(), JSON.parse(selectedMarket!.clobTokenIds) as string[]);
    let orderBookMsg = getOrderBookMsg(orderBook, selectedYesOrNo!);
    orderTypeMsg += orderBookMsg;

    orderTypeMsg += '\n*Please select order type: *\n';
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

