import { Telegraf, Markup, Context } from "telegraf";
import { generateRandomPrivateKey } from '../utils/utils';
import UserInfo from "../schema/UserInfo";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { initClobClient, initClobClientEOA, initClobClientEmail, initClobClientGnosis } from "../clobclientInit";
import 'dotenv/config';
import { ApiKeyCreds } from "@polymarket/clob-client/dist/types";
import { createProxyWallet } from "../generateProxyWallet";
import { User } from "@telegraf/types";
import { WELCOME_DISMISS_GENERATE_WALLET } from "../utils/constant";
import { showIndex } from "./index";



export function welcome(bot: Telegraf) {
    bot.start(async (ctx) => {
        const startPayload = ctx.startPayload; // 获取深链接中的参数部分
        console.log(`Received start payload: ${startPayload}`);
        console.log("在start处：", ctx);
        //查询
        var userInfo = await queryUserInfo(ctx.from.id.toString());

        // console.log(userInfo);

        var telegramUserInfo = ctx.from;
        if (userInfo == null) {
            var randomWallet = await initUser(bot, ctx, telegramUserInfo);
            ctx.reply('Please wait while initializing user information...');
            await initUserPolymarketAccount(randomWallet, bot, ctx, telegramUserInfo);
        }
        showIndex(ctx);
    })
}



async function initUserPolymarketAccount(randomWallet: any, bot: Telegraf, ctx: Context, telegramUserInfo: User) {
    //createApiKey
    var creds = await createApiKey(randomWallet.privateKey);

    //generate proxy wallet
    var proxyWallet = await createProxyWallet(randomWallet.address, randomWallet.privateKey);

    //exception
    if (!randomWallet || !creds || !proxyWallet) {
        ctx.reply('Init failed, Please restart bot.');
        return;
    }

    //save to db
    await saveUserInfo(telegramUserInfo.id.toString(), randomWallet.address, randomWallet.privateKey, creds, proxyWallet);
}

async function initUser(bot: Telegraf, ctx: Context, telegramUserInfo: User) {
    //generate new private key
    var randomWallet = generateRandomPrivateKey();
    console.log(randomWallet);

    const buttons = [
        Markup.button.callback('× Dismiss Message', WELCOME_DISMISS_GENERATE_WALLET)
    ];

    let showContent =
        `
      👋 Welcome to Ploy${telegramUserInfo.first_name}\\!
      \nA new wallet has been generated for you\\. *Save the private key below❗*
      \n*address:*${randomWallet.address}
      \n*PK:*${randomWallet.privateKey}
      \n*To get started, please read our [docs](${process.env.DOCS})\\!*
      `;
    ctx.replyWithMarkdownV2(showContent, { reply_markup: { inline_keyboard: [buttons] } });
    bot.action('dismiss_generate_wallet', async (ctx: Context) => {
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
    });
    return randomWallet;
}

async function queryUserInfo(id: string) {
    var userInfo = await UserInfo.findById(id);
    if (userInfo == null) {
        return;
    }
    return userInfo;
}

async function saveUserInfo(id: string, userAddress: string, userPrivateKey: string, creds: ApiKeyCreds, proxyWallet: string) {
    let userInfo = new UserInfo({
        _id: id,
        userAddress: userAddress,
        userPrivatekey: userPrivateKey,
        clobApiKey: creds.key,
        clobSecret: creds.secret,
        clobPassPhrase: creds.passphrase,
        proxyWallet: proxyWallet
    })
    await userInfo.save();
}


async function createApiKey(privateKey: string) {
    var clobClient = initClobClient(privateKey);
    const creds = await clobClient.createApiKey(); // nonce defaults to 0
    console.log('creds:', creds);
    return creds;
}