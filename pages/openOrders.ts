import { Context, Telegraf, Markup } from "telegraf";
import { ExtraReplyMessage, ExtraEditMessageText } from "telegraf/typings/telegram-types";
import 'dotenv/config';
import { initClobClientGnosis } from "./clobclientInit";
import { formatExpiration, formatString } from "../utils/utils";
import { OPEN_ORDERS_REFRESH, BACK_TO_INDEX } from "../utils/constant";
import axios from "axios";

var openOrderMap: Map<string, IOpenOrder[]> = new Map();

export async function showOpenOrders(ctx: Context) {
    var openOrdersMsg = await queryOpenOrdersShowMsg(ctx);
    ctx.replyWithMarkdownV2(openOrdersMsg as string, { reply_markup: { inline_keyboard: getOpenOrdersMenu() }, disable_web_page_preview: true } as ExtraReplyMessage);
}

export async function updateOpenOrders(ctx: Context) {
    var openOrdersMsg = await queryOpenOrdersShowMsg(ctx);

    //更新内容
    ctx.editMessageText(
        openOrdersMsg as string,
        {
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: getOpenOrdersMenu()
            }
        } as ExtraEditMessageText
    ).catch((error) => {
        console.log(error);
    })
}

async function queryOpenOrdersShowMsg(ctx: Context) {
    var openOrderList: IOpenOrder[] | null = await getActiveOrders(ctx.from!.id.toString());
    return await getShowMsg(ctx, openOrderList);
}

async function getShowMsg(ctx: Context, openOrderList: IOpenOrder[] | null) {
    var openOrdersHeader = '*Open orders*\n'
    if (!openOrderList || openOrderList.length == 0) {
        return openOrdersHeader + "\nNo open orders data";
    }

    //缓存订单列表
    openOrderMap.set(ctx.from!.id.toString(), openOrderList);

    var showMsg: string = '';
    for (var i = 0; i < openOrderList.length; i++) {
        var element = openOrderList[i];
        if (i == 0) {
            showMsg += openOrdersHeader;
        }

        var total = (parseFloat(element.original_size) * parseFloat(element.price)).toFixed(2);

        var market: IMarket[] = await getMarketApi(element.market);

        var cancelOrderUrl = `https://t.me/polymarket_kbot?start=co-${element.id.substring(2).slice(0, -5)}`
        console.log('cancelOrderUrl:', cancelOrderUrl);

        showMsg += `\n• Market: [${formatString(market[0].question)}](https://polymarket.com/event/${market[0].event_slug}/${market[0].market_slug}) 📈`
        showMsg += `\n• Side: ${element.side}`;
        showMsg += `\n• Outcome: ${element.outcome}`
        showMsg += `\n• Operation: [\\[Cancel\\]](${cancelOrderUrl})`
        showMsg += `\n• Price: ${formatString(Math.round(parseFloat(element.price) * 100).toString())}¢`
        showMsg += `\n• Filled: ${element.size_matched} / ${element.original_size}`
        showMsg += `\n• Total: $${formatString(total.toString())}`
        showMsg += `\n• Expiration: ${formatExpiration(element.expiration)}`
        showMsg += `\n`;
    }
    return showMsg;
}


function getOpenOrdersMenu() {
    return [[
        {
            text: "Refresh",
            callback_data: OPEN_ORDERS_REFRESH
        }
    ], [
        Markup.button.callback('↩︎ Back', BACK_TO_INDEX),
    ]]
}


export async function deleteStartMessageAndCancelOrder(ctx: Context, prefixOrderId: string) {
    var orderList: IOpenOrder[] | undefined = openOrderMap.get(ctx.from!.id.toString());
    if(!orderList || orderList.length == 0) {
        return;
    }
    var orderId: string = '';
    for (var i = 0; i < orderList.length; i++) {
        if (orderList[i].id.startsWith('0x' + prefixOrderId)) {
            orderId = orderList[i].id;
        }
    }
    if(orderId.length == 0) {
        return;
    }
    var success = await cancelOrder(ctx, orderId);
    ctx.deleteMessage();  // 删除当前的消息
    // ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
    if(success) {
        ctx.reply('✅ This open order cancel success. Click refresh button view the updated list.')
    }
}

export async function deleteOpenOrderMap(id: string) {
    openOrderMap.delete(id);
}

export async function cancelOrder(ctx: Context, orderId: string) {
    const clobClient = await initClobClientGnosis(ctx.from!.id.toString());
    if (!clobClient) {
        return false;
    }
    const resp = await clobClient.cancelOrder({
        orderID:
            orderId,
    });
    // console.log('cancelOrder:', resp);
    if(resp && resp.canceled[0] === orderId) {
        //success
        return true;
    }
    return false;
}

async function getMarketApi(marketId: string) {
    var url = `https://clob.polymarket.com/rewards/markets/${marketId}`;
    const market = await axios.get(url);
    // console.log('getMarketApi:', market.data);
    return market.data.data as IMarket[];
}

async function getActiveOrders(id: string): Promise<IOpenOrder[] | null> {
    const clobClient = await initClobClientGnosis(id);
    if (!clobClient) {
        return null;
    }
    var openOrdersList: IOpenOrder[] = await clobClient.getOpenOrders();
    console.log("getActiveOrders:", openOrdersList);
    return openOrdersList;
}

interface IMarket {
    condition_id: string;
    question: string;
    market_slug: string;
    event_slug: string;
    image: string;
}

interface IOpenOrder {
    id: string;
    status: string;
    owner: string;
    maker_address: string;
    market: string;
    asset_id: string;
    side: string;
    original_size: string;
    size_matched: string;
    price: string;
    outcome: string;
    expiration: string;
    order_type: string;
    created_at: number;
}