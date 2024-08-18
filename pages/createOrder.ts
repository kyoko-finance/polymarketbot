
import { Context, Telegraf, Markup } from "telegraf";
import { MyContext } from "../index";
import { initClobClientGnosis } from "../clobclientInit";
import { Side, OrderType, UserOrder } from "@polymarket/clob-client";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { isValidAmountOrPrice } from "../utils/utils";



export async function handleInputAmountOrPrice(ctx: MyContext, text: string) {
    let isInputAmountState = ctx.session?.currentInputAmountState;
    let isInputPriceState = ctx.session?.currentInputPriceState;
    let selectedMarketOrLimit = ctx.session!.selectedMarketOrLimit;
    if (!isInputAmountState && !isInputPriceState) {
        return;
    }
    if (isInputAmountState) {
        if (!isValidAmountOrPrice(text)) {
            ctx.reply("🥲Input amount error\\.");
            return;
        }
        ctx.session!.inputAmount = text;
        //开始提示让用户输入价格，如果是市价单，直接执行
        if (selectedMarketOrLimit == '0') {
            //市价单执行
            let inputAmount = ctx.session?.inputAmount;
            let inputPrice = ctx.session?.inputPrice;
            if (!inputAmount) {
                console.log('inputAmount error');
                return;
            }
            await ctx.reply('✅The amount you entered is: ' + text);
            createOrder(ctx, selectedMarketOrLimit, Number(inputAmount), Number(inputPrice))
        } else {
            //限价单
            let currentInputMessageId = ctx.session!.currentInputMessageId;
            showInputPirce(ctx, currentInputMessageId, text);
        }
        return;
    }
    if (isInputPriceState) {
        if (!isValidAmountOrPrice(text)) {
            ctx.reply("🥲Input price error\\.");
            return;
        }
        ctx.session!.inputPrice = text;
        //直接执行
        let inputAmount = ctx.session?.inputAmount;
        let inputPrice = ctx.session?.inputPrice;
        if (!inputAmount || !inputPrice) {
            console.log('amount or price error');
            return;
        }
        createOrder(ctx, selectedMarketOrLimit, Number(inputAmount), Number(inputPrice))
        return;
    }
}


export function showInputAmount(ctx: MyContext, marketOrLimit: string, messageId: number) {
    ctx.session!.inputPrice = undefined;//清空价格
    ctx.session!.selectedMarketOrLimit = marketOrLimit;
    ctx.session!.currentInputAmountState = true;
    ctx.session!.currentInputPriceState = false;
    ctx.session!.currentInputMessageId = messageId;
    ctx.reply("Please input amount:", {
        reply_to_message_id: messageId,
    } as ExtraReplyMessage);
}

export function showInputPirce(ctx: MyContext, messageId: number, amount: string) {
    ctx.session!.currentInputAmountState = false;
    ctx.session!.currentInputPriceState = true;
    ctx.reply(`✅The amount you entered is: ${amount} \n⏭️Please input price:`, {
        reply_to_message_id: messageId,
    } as ExtraReplyMessage);
}


export async function createOrder(ctx: MyContext, marketOrLimit: string, amount: number, price: number) {
    let selectedEvent = ctx.session?.selectedEvent;
    let selectedMarket = ctx.session?.selectedMarket;
    let selectedYesOrNo = ctx.session?.selectedYesOrNo;
    let selectedBuyOrSell = ctx.session?.selectedBuyOrSell;

    let marketOrLimitStr = marketOrLimit == '0' ? '市价单' : '限价单';
    let yesOrNoStr = selectedYesOrNo == '0' ? 'Yes' : 'No';
    let buyOrSellStr = selectedBuyOrSell == '0' ? 'Buy' : 'Sell';
    ctx.reply('你最终选择了:' + marketOrLimitStr + ",事件id:" + selectedEvent?.id + ",marketId:" + selectedMarket?.id +
        ",选中YesOrNo:" + yesOrNoStr + ',选中BuyOrSell:' + buyOrSellStr + ',数量：' + amount + ',价格：' + price);
    return;
    let tokenId: string;
    let tokenIdsArray: string[] = JSON.parse(selectedMarket!.clobTokenIds);
    if (selectedYesOrNo) {
        //Yes
        tokenId = tokenIdsArray[0];
    } else {
        //No
        tokenId = tokenIdsArray[1];
    }

    //请求最新价格
    if (marketOrLimit == '0') {
        price = 88.88;
    }
    console.log("最终成交价格")


    console.log("tokenId:", tokenId);

    if (marketOrLimit == '0' && selectedBuyOrSell == '0') {
        var resp = await createBuyMarketOrder(ctx, tokenId, amount);
        return;
    }
    let userOrder: UserOrder = {
        tokenID:
            `${tokenId}`,//67651190137384692436254313465446414883079283131079052933923486306417976524160
        price: price,//0.08
        side: selectedBuyOrSell == '0' ? Side.BUY : Side.SELL,
        size: amount,//20
        feeRateBps: 0,
        nonce: 0,
    }
    var resp = await createNormalOrder(ctx, userOrder);

}



async function createNormalOrder(ctx: Context, userOrder: UserOrder) {
    const clobClient = await initClobClientGnosis(ctx.from!.id.toString());
    if (!clobClient) {
        return;
    }
    const order = await clobClient.createOrder(userOrder);
    // console.log("Created Order", order);

    // GTC Order
    const resp = await clobClient.postOrder(order, OrderType.GTC);
    console.log('createBuyLimitOrder:', resp);
    return resp;
}

async function createBuyMarketOrder(ctx: Context, tokenID: string, amount: number) {
    const clobClient = await initClobClientGnosis(ctx.from!.id.toString());
    if (!clobClient) {
        return;
    }
    const marketOrder = await clobClient.createMarketBuyOrder({
        tokenID: `${tokenID}`,
        amount: amount,
        feeRateBps: 0,
        nonce: 0,
    });
    // console.log("Created Order", marketOrder);

    // FOK Order
    const resp = await clobClient.postOrder(marketOrder, OrderType.FOK);
    console.log('createBuyMarketOrder:', resp);
    return resp;
}