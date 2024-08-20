import { Telegraf, Markup, Context, session } from 'telegraf'
import { showCategoryList } from './categoryList';


export function commands(bot: Telegraf) {
    bot.telegram.setMyCommands([
        { command: 'start', description: 'Main menu' },
        { command: 'markets', description: 'Go to markets' }
    ]);

    // 处理 命令
    bot.command('markets', (ctx) => {
        showCategoryList(bot, ctx);
    });
}