import { Telegraf, Markup, Context, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { DBConnect, getInstance } from './utils/db';
import { welcome } from './pages/welcome';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { actions } from './pages/actions';
import 'dotenv/config';
import { IEvent } from './pages/eventList';


interface SessionData {
  selectedEventList: IEvent[];
}

export interface MyContext extends Context {
  session?: SessionData;
}

async function main() {
  //connect database
  await DBConnect();

  const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN as string)


  // 设置 session 中间件
  bot.use(session());
  bot.use((ctx, next) => {
    ctx.session ??= { selectedEventList: [] };
    next();
  })

  welcome(bot);
  actions(bot);


  // bot.help((ctx) => ctx.reply('Send me a sticker'))
  // bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
  // bot.hears('hi', (ctx) => ctx.reply('Hey there'))
  // bot.on(message('text'), async (ctx, next) => {
  //   // Using context shortcut
  //   // console.log("消息内容:", ctx.message.text)
  //   console.log("on session:", ctx.session);
  //   next();
  // })

  bot.launch()
  console.log('bot launch success')

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

main();