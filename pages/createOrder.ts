
import { Context, Telegraf, Markup } from "telegraf";
import { MyContext } from "../index";
import { initClobClientGnosis } from "../clobclientInit";
import { Side, OrderType } from "@polymarket/clob-client";



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