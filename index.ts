import { Telegraf, Markup, Context, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { DBConnect, getInstance } from './utils/db';
import { welcome } from './pages/welcome';
import { actions } from './pages/actions';
import 'dotenv/config';
import { IEvent, IMarket } from './pages/eventList';
import { ICategory } from './pages/categoryList';
import { handleInputAmountOrPrice } from './pages/createOrder';
import { commands } from './pages/commands';
import { deposit } from './profile/deposit';
import { withdraw } from './profile/withdraw';


interface SessionData {
  categoryList: ICategory[] | undefined;
  selectedCategory: ICategory | undefined;
  topicList: ICategory[] | undefined;
  selectedTopic: ICategory | undefined;

  selectedEventList: IEvent[];
  selectedEvent: IEvent;
  selectedMarket: IMarket;
  selectedYesOrNo: string;
  selectedBuyOrSell: string | undefined;
  selectedMarketOrLimit: string;

  // orderBook: IOrderBook[] | undefined;
  currentInputAmountState: boolean;
  currentInputPriceState: boolean;
  currentInputMessageId: number;
  inputAmount: string | undefined;
  inputPrice: string | undefined;

  currentInputDepositUsdcState: boolean;
  currentInputWithdrawUsdcState: boolean;
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
  commands(bot);


  bot.on(message('text'), async (ctx, next) => {
    let text = ctx.message.text;
    let currentInputDepositUsdcState = ctx.session!.currentInputDepositUsdcState;
    if(currentInputDepositUsdcState) {
      deposit(ctx, text);
      return;
    }
    let currentInputWithdrawUsdcState = ctx.session!.currentInputWithdrawUsdcState;
    if(currentInputWithdrawUsdcState) {
      withdraw(ctx, text);
      return;
    }
    handleInputAmountOrPrice(ctx, text);
  });


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