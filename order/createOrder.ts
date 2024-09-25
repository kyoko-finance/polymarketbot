
import { Context, Telegraf, Markup } from "telegraf";
import { MyContext } from "../index";
import { initClobClientGnosis } from "../init/clobclientInit";
import { Side, OrderType, UserOrder } from "@polymarket/clob-client";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { formatString, isValidAmountOrPrice, validPrice } from "../utils/utils";
import { CREATE_ORDER_SELL_25_PERCENT, CREATE_ORDER_SELL_50_PERCENT, CREATE_ORDER_SELL_75_PERCENT, CREATE_ORDER_SELL_100_PERCENT, WELCOME_DISMISS_GENERATE_WALLET } from "../utils/constant";



export async function handleInputAmountOrPrice(ctx: MyContext, text: string) {
    let isInputAmountState = ctx.session?.currentInputAmountState;
    let isInputPriceState = ctx.session?.currentInputPriceState;
    let selectedMarketOrLimit = ctx.session!.selectedMarketOrLimit;
    if (!isInputAmountState && !isInputPriceState) {
        return;
    }
    if(!selectedMarketOrLimit) {
        console.log("handleInputAmountOrPrice-selectedMarketOrLimit is undefined");
        return;
    }
    if (isInputAmountState) {
        if (!isValidAmountOrPrice(text)) {
            ctx.reply("🥲Input error.");
            return;
        }
        ctx.session!.inputAmount = text;
        //开始提示让用户输入价格，如果是市价单，直接执行
        if (selectedMarketOrLimit == '0') {
            //市价单执行
            if (!text) {
                console.log('input amount error');
                return;
            }
            let selectedBuyOrSell = ctx.session?.selectedBuyOrSell;
            if (selectedBuyOrSell == '0') {
                //buy
                await ctx.reply('✅The amount you entered is: $' + text);
            } else {
                await ctx.reply('✅The shares you entered is: ' + text);
            }
            createOrder(ctx, selectedMarketOrLimit, Number(text), 0)
        } else {
            //限价单执行
            //当前输入的是share的话，需要校验不小于5
            if (Number(text) < 5) {
                ctx.reply('Minimum 5 shares for limit orders');
                ctx.session!.inputAmount = undefined;
                return;
            }
            showInputPirce(ctx, text);
        }
        return;
    }
    if (isInputPriceState) {
        if (!validPrice(text)) {
            ctx.reply("🥲Input price error\\.");
            return;
        }
        let inputPrice = (parseFloat(text) / 100).toFixed(3);
        //直接执行
        let inputAmount = ctx.session?.inputAmount;
        if (!inputAmount || !inputPrice) {
            console.log('amount or price error');
            return;
        }
        createOrder(ctx, selectedMarketOrLimit, Number(inputAmount), Number(inputPrice));
        return;
    }
}


export function showInputAmount(ctx: MyContext, marketOrLimit: string, messageId: number) {
    // ctx.session!.inputPrice = undefined;//清空价格
    ctx.session!.selectedMarketOrLimit = marketOrLimit;
    ctx.session!.currentInputAmountState = true;
    ctx.session!.currentInputPriceState = false;
    ctx.session!.currentInputMessageId = messageId;

    // let selectedYesOrNo = ctx.session?.selectedYesOrNo;
    let selectedBuyOrSell = ctx.session?.selectedBuyOrSell;

    let replyMsg = 'Please input shares:';
    let palceHolderMsg = 'Please Input shares';
    if (selectedBuyOrSell == '1') {
        //sell,此处输入数量改为弹出百分比按钮
        showSellPercentButton(ctx);
        return;
    }
    //市价单&buy,直接输入购买金额
    if (marketOrLimit == '0' && selectedBuyOrSell == '0') {
        replyMsg = 'Please input amount($):';
        palceHolderMsg = 'Please Input amount($)'
    }
    ctx.reply(replyMsg, {
        reply_to_message_id: messageId,
        reply_markup: {
            force_reply: true, // 强制用户回复
            input_field_placeholder: palceHolderMsg, // 改变输入框中的提示文字
        },
    } as ExtraReplyMessage);
}


async function showSellPercentButton(ctx: MyContext) {
    let selectedSellPosition = ctx.session!.selectedSellPosition;
    if(!selectedSellPosition) {
        return;
    }
    let selectedEvent = ctx.session!.selectedEvent;
    let selectedMarket = ctx.session!.selectedMarket;
    let selectedYesOrNo = ctx.session!.selectedYesOrNo;
    // let selectedBuyOrSell = ctx.session!.selectedBuyOrSell;
    let selectedMarketOrLimit = ctx.session!.selectedMarketOrLimit;
    let marketOrLimitStr = selectedMarketOrLimit == '0' ? 'market order' : 'limit order';

    console.log('marketOrLimitStr:', marketOrLimitStr);

    let yesOrNoStr = '';
    if (selectedYesOrNo === '0') {
        //buy
        yesOrNoStr = 'Yes';
    } else {
        //sell
        yesOrNoStr = 'No';
    }

    let sellPercentMsg = '';
    if (selectedEvent.markets.length > 1) {
        sellPercentMsg += `1\\. You have select *${formatString(selectedMarket.groupItemTitle)}\\-${yesOrNoStr}\\-Sell\\-${marketOrLimitStr}*\\.\n`;
    } else {
        sellPercentMsg += `1\\. You have select *${yesOrNoStr}\\-Sell\\-${marketOrLimitStr}*\\.\n`;
    }
    sellPercentMsg += `2\\. *Please select the percentage you want to sell\\. *\n3\\. Your current market position: ${formatString(selectedSellPosition.size.toString())} • ${Math.round(selectedSellPosition.avgPrice * 100)}¢\n`;
    ctx.replyWithMarkdownV2(sellPercentMsg, { reply_markup: { inline_keyboard: getSellPercentMenu() }, disable_web_page_preview: true } as ExtraReplyMessage)
}

export async function afterSelectPercentButton(ctx: MyContext, percent: number) {
    let selectedBuyOrSell = ctx.session?.selectedBuyOrSell;
    if (selectedBuyOrSell == '0') {
        return;
    }
    let selectedSellPosition = ctx.session!.selectedSellPosition;
    if(!selectedSellPosition) {
        return;
    }

    //删除选择百分比的消息
    await ctx.deleteMessage();

    let sellPositionShare = selectedSellPosition.size * percent;
    ctx.session!.inputAmount = sellPositionShare.toString();
    //开始提示让用户输入价格，如果是市价单，直接执行
    let selectedMarketOrLimit = ctx.session!.selectedMarketOrLimit;
    if (selectedMarketOrLimit == '0') {
        //市价单执行
        if (!sellPositionShare) {
            console.log('input amount error');
            return;
        }
        await ctx.reply('✅The shares you select is: ' + sellPositionShare);
        //传入0是最后的提交订单处，如果是sell-market price则会去请求最新价格
        createOrder(ctx, selectedMarketOrLimit, sellPositionShare, 0);
    } else {
        //限价单执行
        //当前输入的是share的话，需要校验不小于5
        if (sellPositionShare < 5) {
            ctx.reply('Minimum 5 shares for limit orders');
            ctx.session!.inputAmount = undefined;
            return;
        }
        showInputPirce(ctx, sellPositionShare.toString());
    }
}

function getSellPercentMenu() {
    return [
        [
            Markup.button.callback('25%', CREATE_ORDER_SELL_25_PERCENT),
        ], [
            Markup.button.callback('50%', CREATE_ORDER_SELL_50_PERCENT),
        ],
        [
            Markup.button.callback('75%', CREATE_ORDER_SELL_75_PERCENT),
        ], [
            Markup.button.callback('100%', CREATE_ORDER_SELL_100_PERCENT),
        ], [
            Markup.button.callback('Cancel', WELCOME_DISMISS_GENERATE_WALLET),
        ]]
}

export function showInputPirce(ctx: MyContext, amount: string) {
    let currentInputMessageId = ctx.session!.currentInputMessageId;
    ctx.session!.currentInputAmountState = false;
    ctx.session!.currentInputPriceState = true;
    ctx.reply(`✅The shares you entered is: ${amount} \n⏭️Please input price(0-100¢):`, {
        reply_to_message_id: currentInputMessageId,
        reply_markup: {
            force_reply: true, // 强制用户回复
            input_field_placeholder: 'Please input price(0-100)¢', // 改变输入框中的提示文字
        },
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

    if (!selectedMarket) {
        ctx.reply('selected market is undefined');
        return;
    }
    let tokenId: string;
    let tokenIdsArray: string[] = JSON.parse(selectedMarket.clobTokenIds);
    if (selectedYesOrNo == '0') {
        //Yes
        tokenId = tokenIdsArray[0];
    } else {
        //No
        tokenId = tokenIdsArray[1];
    }

    if (marketOrLimit == '0' && selectedBuyOrSell == '1') {
        //市价单，并且sell的情况下才需要查询价格，buy单只是需要添加金额
        let priceInfo = await getLastPrice(ctx, tokenId);
        if (!priceInfo) {
            return;
        }
        console.log('priceInfo:', priceInfo);
        let priceDetails: PriceDetails = priceInfo[tokenId];
        console.log('价格是多少：', priceDetails.BUY, ',', priceDetails.SELL);
        price = parseFloat(priceDetails.BUY);
    }

    if (marketOrLimit == '0' && selectedBuyOrSell == '0') {
        //市价单&buy
        let resp = await createBuyMarketOrder(ctx, tokenId, amount);
        if (!resp || !resp.success) {
            console.log('resp:', resp);
            ctx.reply('Create order failed2.');
            return;
        }
        afterCreateOrderSuccess(ctx, resp);
        return;
    }

    console.log('你最终选择了:' + marketOrLimitStr + ",事件id:" + selectedEvent?.id + ",marketId:" + selectedMarket?.id +
        ",选中YesOrNo:" + yesOrNoStr + ',选中BuyOrSell:' + buyOrSellStr + ',数量：' + amount + ',价格：' + price);

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
        ctx.reply('Create order failed1.');
        console.log('-----------------------')
        console.log(resp);
        console.log('-----------------------')
        return;
    }
    afterCreateOrderSuccess(ctx, resp);
}

function afterCreateOrderSuccess(ctx: MyContext, resp: IOrder) {
    let successMessage = `🎉🎉🎉Create order success. `;
    if (resp.transactionsHashes) {
        successMessage += `TxHash:${resp.transactionsHashes}`;
    }
    ctx.reply(successMessage);
    //清空下单过程的相关信息
    ctx.session!.currentInputAmountState = false;
    ctx.session!.currentInputPriceState = false;
    ctx.session!.selectedMarketOrLimit = undefined;
    try {
        ctx.deleteMessage(ctx.session!.currentInputMessageId);
    } catch(error) {
        console.log('delete message error');
    }
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

/**
 * 
 * @param ctx 
 * @param tokenID 
 * @param amount 代表你要购买的金额
 * @returns 
 */
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
        console.log('createBuyMarketOrder failed:', error);
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