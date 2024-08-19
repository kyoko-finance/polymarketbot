import axios from "axios";
import { Context, Markup } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import 'dotenv/config';
import { BACK_TO_INDEX } from "../utils/constant";
import { queryUserInfo } from "../utils/db";
import { formatString } from "../utils/utils";
import { IEvent } from "./eventList";
import { MyContext } from '../index';



export async function showPositions(ctx: Context) {
    var positionsMsg = await queryPositionsShowMsg(ctx);
    ctx.replyWithMarkdownV2(positionsMsg as string, { reply_markup: { inline_keyboard: getPositionsMenu() }, disable_web_page_preview: true } as ExtraReplyMessage);
}

async function queryPositionsShowMsg(ctx: MyContext) {
    var userInfo = await queryUserInfo(ctx.from!.id.toString());
    if (!userInfo) {
        return;
    }
    var positionsHeader = '*Positions*\n'
    var positionList: IPosition[] | null = await getPositionsApi(userInfo.proxyWallet);
    if (!positionList || positionList.length == 0) {
        return positionsHeader + "\nNo positions data";
    }

    let positionEventList = await queryEventList(positionList);
    if (!positionEventList || positionEventList.length != positionList.length) {
        console.log('查询position列表的event列表异常');
        return;
    }
    //sort positionEventList,将请求的eventList按照positionList的索引排序后保存
    positionEventList.sort((a, b) => {
        const indexA = positionList!.findIndex(pos => pos.eventSlug === a.slug);
        const indexB = positionList!.findIndex(pos => pos.eventSlug === b.slug);
        return indexA - indexB;
    });
    ctx.session!.selectedEventList = positionEventList;

    var showMsg: string = '';
    positionList.forEach((element, index) => {
        //ed表示event detail
        var tradeUrl = `https://t.me/polymarket_kbot?start=ed-${positionEventList[index].id}`
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
        showMsg += `\n• Operation: [*[Trade]*](${tradeUrl})`;
        showMsg += `\n`;
    });
    return showMsg;
}

async function queryEventList(positionList: IPosition[]) {
    //https://gamma-api.polymarket.com/events?slug=presidential-election-winner-2024&slug=which-party-wins-presidency-popular-vote
    let url = `https://gamma-api.polymarket.com/events?`;
    let params = positionList.map(element => `slug=${element.eventSlug}`).join('&');
    url += params;
    console.log('url是：', url);
    var resp = await axios.get(url);
    var eventList: IEvent[] = resp.data;
    console.log('事件列表:', eventList.length);
    return eventList;
}


function getPositionsMenu() {
    return [[
        Markup.button.callback('↩︎ Back', BACK_TO_INDEX),
    ]]
}

async function getPositionsApi(proxyWallet: string) {
    let url = `https://data-api.polymarket.com/positions?user=${proxyWallet}`;
    console.log(url);
    const positions = await axios.get(url);
    var positionList = positions.data;
    console.log('getPositions:', positionList);
    return positionList as IPosition[] | null;
}

export interface IPosition {
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