import { Context, Telegraf, Markup } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import 'dotenv/config';
import { initClobClientGnosis } from "../clobclientInit";
import { formatExpiration, formatTimestampToString, omitTxhash } from "../utils/utils";
import { BACK_TO_INDEX } from "../utils/constant";
import axios from "axios";



export async function showOpenOrders(ctx: Context) {
    var openOrdersMsg = await queryOpenOrdersShowMsg(ctx);
    ctx.replyWithMarkdownV2(openOrdersMsg as string, { reply_markup: { inline_keyboard: getOpenOrdersMenu() }, disable_web_page_preview: true } as ExtraReplyMessage);
}

async function queryOpenOrdersShowMsg(ctx: Context) {
    var openOrdersHeader = '*Open orders*\n'
    var openOrderList: IOpenOrder[] | null = await getActiveOrders(ctx.from!.id.toString());
    if (!openOrderList || openOrderList.length == 0) {
        return openOrdersHeader + "\nNo open orders data";
    }
    var showMsg: string = '';
    for (var i = 0; i < openOrderList.length; i++) {
        var element = openOrderList[i];
        if (i == 0) {
            showMsg += openOrdersHeader;
        }

        var total = (parseFloat(element.original_size) * parseFloat(element.price)).toFixed(2);

        var market: IMarket[] = await getMarketApi(element.market);

        showMsg += `\n• Market: [${market[0].question}](https://polymarket.com/event/${market[0].event_slug}/${market[0].market_slug}) 📈`
        showMsg += `\n• Side: ${element.side}`;
        showMsg += `\n• Outcome: ${element.outcome}`
        showMsg += `\n• Price: ${Math.round(parseFloat(element.price) * 100).toString().replace('.', '\\.')}¢`
        showMsg += `\n• Filled: ${element.size_matched} / ${element.original_size}`
        showMsg += `\n• Total: $${total.toString().replace('.', '\\.')}`
        showMsg += `\n• Expiration: ${formatExpiration(element.expiration)}`
        showMsg += `\n`;
    }
    return showMsg;
}


function getOpenOrdersMenu() {
    return [[
        Markup.button.callback('↩︎ Back', BACK_TO_INDEX),
    ]]
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