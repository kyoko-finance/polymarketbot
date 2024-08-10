import { Telegraf, Markup, Context } from "telegraf";
import { generateRandomPrivateKey } from './utils/utils';
import UserInfo from "./schema/UserInfo";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { initClobClient, initClobClientEOA, initClobClientEmail, initClobClientGnosis } from "./clobclientInit";
import 'dotenv/config';
import { ApiKeyCreds } from "@polymarket/clob-client/dist/types";
import { createProxyWallet } from "./generateProxyWallet";
import { User } from "@telegraf/types";

const docs = 'https://learn.polymarket.com/'
const website = 'https://polymarket.com/'

export function welcome(bot: Telegraf) {

    bot.start(async (ctx) => {
        //查询
        var userInfo = await queryUserInfo(ctx.from.id.toString());

        // console.log(userInfo);

        var telegramUserInfo = ctx.from;
        if (userInfo == null) {
            var randomWallet = await initUser(bot, ctx, telegramUserInfo);
            ctx.reply('Please wait while initializing user information!!');
            initUserPolymarketAccount(randomWallet, bot, ctx, telegramUserInfo);
        }
        var indexMsg = `
        *Polymarket*
Your first polymarket trading bot
———————————————
📖 [Docs](${docs})
💬 [Official Chat](${website})
🌍 [Website](${website})
\n*The world\\'s largest prediction market\\. *
              `;
        //主页面
        ctx.replyWithMarkdownV2(indexMsg, { reply_markup: { inline_keyboard: getIndexMenu() }, disable_web_page_preview: true } as ExtraReplyMessage);
        //主界面action
        bot.action('dismiss_index_page', async (ctx: Context) => {
            ctx.deleteMessage();  // 删除当前的消息
            ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
        });
    })
}

async function initUserPolymarketAccount(randomWallet: any, bot: Telegraf, ctx: Context, telegramUserInfo: User) {
    //createApiKey
    var creds = await createApiKey(randomWallet.privateKey);

    //generate proxy wallet
    var proxyWallet = await createProxyWallet(randomWallet.address, randomWallet.privateKey);

    //exception
    if (!randomWallet || !creds || !proxyWallet) {
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
        Markup.button.callback('× Dismiss Message', 'dismiss_generate_wallet')
    ];

    let showContent =
        `
      👋 Welcome to Ploy${telegramUserInfo.first_name}\\!
      \nA new wallet has been generated for you\\. *Save the private key below❗*
      \n*address:*${randomWallet.address}
      \n*PK:*${randomWallet.privateKey}
      \n*To get started, please read our [docs](${docs})\\!*
      `;
    ctx.replyWithMarkdownV2(showContent, { reply_markup: { inline_keyboard: [buttons] } });
    bot.action('dismiss_generate_wallet', async (ctx: Context) => {
        ctx.deleteMessage();  // 删除当前的消息
        ctx.answerCbQuery();  // 回应按钮点击（防止加载动画持续）
    });
    return randomWallet;
}

function getIndexMenu() {
    return [[
        {
            text: "🎯 Markets",
            callback_data: "index_page_markets"
        }
    ], [
        {
            text: "🐠 Positions",
            callback_data: "index_page_positions"
        }
    ], [
        {
            text: "🍕 Open orders",
            callback_data: "index_page_open_orders"
        }
    ], [
        {
            text: "🦄 History",
            callback_data: "index_page_history"
        }
    ], [
        Markup.button.callback('🤑 Profile&Assets', 'index_page_profile'),
    ], [
        Markup.button.callback('❌ Close', 'index_page_dismiss'),
    ]]
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