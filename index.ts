import { Telegraf, Markup, Context } from 'telegraf'
import { message } from 'telegraf/filters'
import { DBConnect, getInstance } from './utils/db';
import { welcome } from './pages/welcome';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { actions } from './pages/actions';
import 'dotenv/config';


async function main() {
  //connect database
  await DBConnect();

  const bot = new Telegraf(process.env.BOT_TOKEN as string)

  welcome(bot);
  actions(bot);


  // bot.help((ctx) => ctx.reply('Send me a sticker'))
  // bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
  // bot.hears('hi', (ctx) => ctx.reply('Hey there'))
  bot.on(message('text'), async (ctx) => {
    // Using context shortcut
    console.log("消息内容:", ctx.message.text)
  })

  bot.launch()
  console.log('bot launch success')

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
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


main();