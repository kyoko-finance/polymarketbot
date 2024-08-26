import { Context, Telegraf, Markup } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import 'dotenv/config';
import axios from "axios";
import { formatString, formatTimestampToString, omitTxhash, orderTypeLogo } from "../utils/utils";
import { BACK_TO_INDEX } from "../utils/constant";
import { queryUserInfo } from "../utils/db";



export async function showHistory(ctx: Context) {
    var historyMsg = await queryHistoryShowMsg(ctx);
    ctx.replyWithMarkdownV2(historyMsg as string, { reply_markup: { inline_keyboard: getHistoryMenu() }, disable_web_page_preview: true } as ExtraReplyMessage);
}

async function queryHistoryShowMsg(ctx: Context) {
    var userInfo = await queryUserInfo(ctx.from!.id.toString());
    if (!userInfo) {
        return;
    }
    var historyHeader = '*History*\n'
    var historyList: IHistory[] = await getHistoryApi(userInfo.proxyWallet);
    if (!historyList || historyList.length == 0) {
        return historyHeader + "\nNo history data";
    }
    var showMsg: string = '';
    historyList.forEach((element, index) => {
        if (index == 0) {
            showMsg += historyHeader;
        }
        showMsg += `\n• Market: *${formatString(element.title)}* 📈`
        showMsg += `\n• Type: ${orderTypeLogo(element.side)}`;
        showMsg += `\n• Outcome: ${element.outcome}`
        showMsg += `\n• Price: ${(Math.round(element.price * 100).toString())}¢`
        showMsg += `\n• Shares: ${Math.round(element.size)}`
        showMsg += `\n• Value: $${formatString(element.usdcSize.toFixed(2).toString())}`
        showMsg += `\n• Date: ${formatTimestampToString(element.timestamp)}`
        showMsg += `\n• Transaction: [${formatString(omitTxhash(element.transactionHash))}](https://polygonscan.com/tx/${element.transactionHash})`
        showMsg += `\n• Detail: [*detail*](https://polymarket.com/event/${element.eventSlug}/${element.slug})`;
        showMsg += `\n`;
    });
    return showMsg;
}


function getHistoryMenu() {
    return [[
        Markup.button.callback('↩︎ Back', BACK_TO_INDEX),
    ]]
}



async function getHistoryApi(proxyWallet: string) {
    // 获取当前时间加1天
    const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    const endTime = Math.floor(tomorrow.getTime() / 1000);
    var url = `https://data-api.polymarket.com/activity?user=${proxyWallet}&limit=20&offset=0&start=1601481600&end=${endTime}&sortBy=TIMESTAMP&sortDirection=DESC`;
    // console.log("history url:", url);
    const historyResp = await axios.get(url);
    // console.log('getHistoryApi:', historyResp.data);
    return historyResp.data as IHistory[];
}

interface IHistory {
    proxyWallet: string;
    timestamp: number;
    side: string;
    title: string;
    icon: string;
    outcome: string;
    size: number;
    usdcSize: number;
    price: number;
    transactionHash: string;
    asset: string;
    eventSlug: string;
    slug: string;
}