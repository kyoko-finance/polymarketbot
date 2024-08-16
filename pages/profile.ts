import { BigNumber, ethers } from "ethers";
import { Context, Telegraf, Markup } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import 'dotenv/config';
import UserInfo, { IUserInfo } from "../schema/UserInfo";
import axios from "axios";
import { formatString, formatUSDC, formatUSDCToString } from "../utils/utils";
import { PROFILE_REFRESH_ASSETS, BACK_TO_INDEX } from "../utils/constant";
import { queryUserInfo } from "../utils/db";



export async function showProfile(ctx: Context) {
    var profileMsg = await queryProfileShowMsg(ctx);
    ctx.replyWithMarkdownV2(profileMsg as string, { reply_markup: { inline_keyboard: getProfileMenu() }, disable_web_page_preview: true } as ExtraReplyMessage);
}

async function queryProfileShowMsg(ctx: Context) {
    var userInfo = await queryUserInfo(ctx.from!.id.toString());
    if (!userInfo) {
        return;
    }

    var positionVaule = await queryCurrentPositionVaule(userInfo.proxyWallet);

    var cash: BigNumber = await queryCash(userInfo.proxyWallet);
    var portfolio = (formatUSDC(cash) + positionVaule).toFixed(2);
    var profileMsg = `
    *Profile*
address: \`${userInfo.userAddress}\`
proxyWallet: \`${userInfo.proxyWallet}\`

*Assets*
cash: $${formatString(formatUSDCToString(cash))}
portfolio:$${formatString(portfolio.toString())}

USDC address: \`0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174\`

*Tips:* Send/withdraw USDC to the proxy wallet address and select Polygon\\.
    `;
    return profileMsg;
}

export async function updateProfile(ctx: Context) {
    var profileMsg = await queryProfileShowMsg(ctx);
    //更新内容
    ctx.editMessageText(
        profileMsg as string,
        {
            parse_mode: 'MarkdownV2',
            reply_markup: {
                inline_keyboard: getProfileMenu()
            }
        }
    ).catch((error) => {
        console.log(error);
    })
}


function getProfileMenu() {
    return [[
        {
            text: "Refresh assets",
            callback_data: PROFILE_REFRESH_ASSETS
        }
    ], [
        Markup.button.callback('↩︎ Back', BACK_TO_INDEX),
    ]]
}


async function queryCash(proxyWallet: string) {
    var provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);
    var erc20Abi = [
        'function balanceOf(address) view returns(uint256)'
    ];
    var USDCContract = new ethers.Contract((process.env.USDC as string), erc20Abi, provider);
    var usdcBalanceOf = await USDCContract.balanceOf(proxyWallet);
    // console.log('usdc:', usdcBalanceOf.toString())

    var USDCEContract = new ethers.Contract((process.env.USDCE as string), erc20Abi, provider);
    var usdceBalanceOf = await USDCEContract.balanceOf(proxyWallet);
    // console.log('usdc.e:', usdceBalanceOf.toString());

    return usdcBalanceOf.add(usdceBalanceOf);
}

async function queryCurrentPositionVaule(proxyWallet: string) {
    const portfolio = await axios.get(`https://polymarket.com/api/profile/positions-value?user=${proxyWallet}`);
    return (portfolio.data).value;
}