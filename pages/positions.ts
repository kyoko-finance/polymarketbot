import axios from "axios";
import { Context, Markup } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import 'dotenv/config';
import { BACK_TO_INDEX } from "../utils/constant";
import { queryUserInfo } from "../utils/db";
import { formatString } from "../utils/utils";



export async function showPositions(ctx: Context) {
    var positionsMsg = await queryPositionsShowMsg(ctx);
    ctx.replyWithMarkdownV2(positionsMsg as string, { reply_markup: { inline_keyboard: getPositionsMenu() }, disable_web_page_preview: true } as ExtraReplyMessage);
}

async function queryPositionsShowMsg(ctx: Context) {
    var userInfo = await queryUserInfo(ctx.from!.id.toString());
    if (!userInfo) {
        return;
    }
    var positionsHeader = '*Positions*\n'
    var positionList: IPosition[] | null = await getPositionsApi(userInfo.proxyWallet);
    if (!positionList || positionList.length == 0) {
        return positionsHeader + "\nNo positions data";
    }
    var showMsg: string = '';
    positionList.forEach((element, index) => {
        if (index == 0) {
            showMsg += positionsHeader;
        }
        showMsg += `\n• Market: *${element.title}* 📈`
        showMsg += `\n• Type: ${element.outcome}`;
        showMsg += `\n• avgPrice: ${formatString(Math.round(element.avgPrice * 100).toString())}¢`
        showMsg += `\n• Shares: ${Math.round(element.size)}`
        showMsg += `\n• Lastest: ${formatString(Math.round(element.curPrice * 100).toString())}¢`
        showMsg += `\n• Bet: $${formatString(element.initialValue.toFixed(2).toString())}`
        showMsg += `\n• Current: $${formatString(element.currentValue.toFixed(2).toString())}\\(${formatString(element.percentPnl.toFixed(2))}%\\)`
        showMsg += `\n• To win: $${formatString(element.size.toFixed(2).toString())}`
        showMsg += `\n• Operation: [*[Trade]*](https://www.google.com.hk/)`;
        showMsg += `\n`;
    });
    return showMsg;
}


function getPositionsMenu() {
    return [[
        Markup.button.callback('↩︎ Back', BACK_TO_INDEX),
    ]]
}

async function getPositionsApi(proxyWallet: string) {
    const positions = await axios.get(`https://polymarket.com/api/profile/positions?user=${proxyWallet}`);
    var positionList = positions.data;
    console.log('getPositions:', positionList);
    return positionList as IPosition[] | null;
}

interface IPosition {
    proxyWallet: string;
    asset: string;
    conditionId: string;
    size: number;
    avgPrice: number;
    initialValue: number;
    currentValue: number;
    cashPnl: number;
    percentPnl: number;
    totalBought: number;
    realizedPnl: number;
    percentRealizedPnl: number;
    curPrice: number;
    redeemable: boolean;
    title: string;
    slug: string;
    eventSlug: string;
    icon: string;
    outcome: string;
    outcomeIndex: number;
    oppositeOutcome: string;
    oppositeAsset: string;
    endDate: string;
    negativeRisk: boolean;
}