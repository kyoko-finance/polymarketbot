import { Telegraf, Markup, Context } from "telegraf";
import { generateRandomPrivateKey } from './utils/utils';
import UserInfo from "./schema/UserInfo";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { initClobClientEOA, initClobClientEmail, initClobClientGnosis } from "./clobClientInit";
import 'dotenv/config';
import { ApiKeyCreds } from "@polymarket/clob-client/dist/types";

const docs = 'https://learn.polymarket.com/'
const website = 'https://polymarket.com/'

export function welcome(bot: Telegraf) {

    bot.start(async (ctx) => {
        //查询
        var userInfo = await queryUserInfo(ctx.from.id.toString());

        // console.log(userInfo);

        if (userInfo == null) {
            //generate new private key
            var randomWallet = generateRandomPrivateKey();
            console.log(randomWallet);

            //createApiKey
            var creds = await createApiKey(randomWallet.privateKey);

            if (!creds) {
                return;
            }

            //save to db
            await saveUserInfo(ctx.from.id.toString(), randomWallet.address, randomWallet.privateKey, creds);

            const buttons = [
                Markup.button.callback('× Dismiss Message', 'dismiss_generate_wallet')
            ];

            // console.log(ctx.from);

            let showContent =
                `
              👋 Welcome to Ploy${ctx.from.first_name}\\!
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
        }
        let indexMsg = `
        *Polymarket*
Your first polymarket trading bot
———————————————
📖 [Docs](${docs})
💬 [Official Chat](${website})
🌍 [Website](${website})
\n*The world\\'s largest prediction market\\. Start your journey\\.*
              `;
        //主页面
        ctx.replyWithMarkdownV2(indexMsg, { reply_markup: { inline_keyboard: getIndexMenu() }, disable_web_page_preview: true } as ExtraReplyMessage);

    })
}

function getIndexMenu() {
    return [[
        {
            text: "第一行第一个",
            callback_data: "fist_1_1"
        },
        {
            text: "第一行第二个",
            callback_data: "fist_1_2"
        }
    ], [
        Markup.button.callback('× Dismiss Message-1', 'dismiss_generate_wallet_1'),
        Markup.button.callback('× Dismiss Message-2', 'dismiss_generate_wallet_2')
    ]]
}

async function queryUserInfo(id: string) {
    var userInfo = await UserInfo.findById(id);
    if (userInfo == null) {
        return;
    }
    return userInfo;
}

async function saveUserInfo(id: string, userAddress: string, userPrivateKey: string, creds: ApiKeyCreds) {
    let userInfo = new UserInfo({
        _id: id,
        userAddress: userAddress,
        userPrivatekey: userPrivateKey,
        clobApiKey: creds.key,
        clobSecret: creds.secret,
        clobPassPhrase: creds.passphrase,
    })
    await userInfo.save();
}


async function createApiKey(privateKey: string) {
    var clobClient = initClobClientEOA(privateKey);
    const creds = await clobClient.createApiKey(); // nonce defaults to 0
    console.log('creds:', creds);
    return creds;
}