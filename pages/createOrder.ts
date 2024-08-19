
import { Context, Telegraf, Markup } from "telegraf";
import { MyContext } from "../index";
import { initClobClientGnosis } from "../clobclientInit";
import { Side, OrderType, UserOrder } from "@polymarket/clob-client";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { isValidAmountOrPrice } from "../utils/utils";
import { IPosition } from "./positions";



export async function handleInputAmountOrPrice(ctx: MyContext, text: string) {
    let isInputAmountState = ctx.session?.currentInputAmountState;
    let isInputPriceState = ctx.session?.currentInputPriceState;
    let selectedMarketOrLimit = ctx.session!.selectedMarketOrLimit;
    if (!isInputAmountState && !isInputPriceState) {
        return;
    }
    if (isInputAmountState) {
        if (!isValidAmountOrPrice(text)) {
            ctx.reply("🥲Input amount error.");
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
        reply_markup: {
            force_reply: true, // 强制用户回复
            input_field_placeholder: 'Please Input amount:', // 改变输入框中的提示文字
        },
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

    let tokenId: string;
    let tokenIdsArray: string[] = JSON.parse(selectedMarket!.clobTokenIds);
    if (selectedYesOrNo == '0') {
        //Yes
        tokenId = tokenIdsArray[0];
    } else {
        //No
        tokenId = tokenIdsArray[1];
    }

    if (marketOrLimit == '0') {
        //市价单
        let priceInfo = await getLastPrice(ctx, tokenId);
        if (!priceInfo) {
            return;
        }
        console.log('priceInfo:', priceInfo);
        let priceDetails: PriceDetails = priceInfo[tokenId];
        console.log('价格是多少：', priceDetails.BUY, ',', priceDetails.SELL);
        if (selectedBuyOrSell == '0') {
            price = parseFloat(priceDetails.SELL);
        } else {
            price = parseFloat(priceDetails.BUY);
        }
    }
    console.log('你最终选择了:' + marketOrLimitStr + ",事件id:" + selectedEvent?.id + ",marketId:" + selectedMarket?.id +
        ",选中YesOrNo:" + yesOrNoStr + ',选中BuyOrSell:' + buyOrSellStr + ',数量：' + amount + ',价格：' + price);

    if (marketOrLimit == '0' && selectedBuyOrSell == '0') {
        let resp = await createBuyMarketOrder(ctx, tokenId, amount);
        if (!resp || !resp.success) {
            ctx.reply('Create order failed.');
            return;
        }
        ctx.reply(`🎉🎉🎉Create order success. TxHash:${resp.transactionsHashes}`);
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
    let resp = await createNormalOrder(ctx, userOrder);
    if (!resp || !resp.success) {
        ctx.reply('Create order failed.');
        return;
    }
    ctx.reply(`🎉🎉🎉Create order success. TxHash:${resp.transactionsHashes}`);
}

/**
 * 市价单创建成功后的字段：
 * {
  errorMsg: '',
  orderID: '0xbf91b307237b2a746d6767f02cb4b3f77da9d47249feeba69153a2e6bd407372',
  takingAmount: '19.230768',
  makingAmount: '9.999999',
  status: 'matched',
  transactionsHashes: [
    '0xf4515a6241f797053638dfa786e1036ac46d7a71c8a7c0a6ac8a421cddb62833'
  ],
  success: true
}
 */
interface IOrder {
    errorMsg: string;
    orderID: string;
    takingAmount: string;
    makingAmount: string;
    status: string;
    transactionsHashes: string[];
    success: boolean;
}



async function createNormalOrder(ctx: Context, userOrder: UserOrder) {
    try {
        const clobClient = await initClobClientGnosis(ctx.from!.id.toString());
        if (!clobClient) {
            return;
        }
        const order = await clobClient.createOrder(userOrder);

        // GTC Order
        const resp: IOrder = await clobClient.postOrder(order, OrderType.GTC);
        console.log('createBuyLimitOrder:', resp);
        return resp;
    } catch (error) {
        console.log('createNormalOrder failed');
        return null;
    }
}

async function createBuyMarketOrder(ctx: Context, tokenID: string, amount: number) {
    try {
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
        const resp: IOrder = await clobClient.postOrder(marketOrder, OrderType.FOK);
        console.log('createBuyMarketOrder:', resp);
        return resp;
    } catch (error) {
        console.log('createBuyMarketOrder failed');
        return null;
    }
}


async function getLastPrice(ctx: Context, tokenId: string) {
    const clobClient = await initClobClientGnosis(ctx.from!.id.toString());
    if (!clobClient) {
        return;
    }

    // const YES =
    //     "69236923620077691027083946871148646972011131466059644796654161903044970987404";
    // const NO =
    //     "87584955359245246404952128082451897287778571240979823316620093987046202296181";

    let prices: IPrice = await clobClient.getPrices([
        { token_id: tokenId, side: Side.BUY },
        { token_id: tokenId, side: Side.SELL }
    ]);
    return prices;
}

interface IPrice {
    [key: string]: PriceDetails;
}

interface PriceDetails {
    BUY: string;
    SELL: string;
}