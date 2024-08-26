import { Telegraf, Markup, Context, session } from 'telegraf'
import { showCategoryList } from '../event/categoryList';
import { showPositions } from '../user/positions';
import { showOpenOrders } from '../user/openOrders';
import { showHistory } from '../user/history';
import { showProfile } from '../user/profile/profile';


export function commands(bot: Telegraf) {
    bot.telegram.setMyCommands([
        { command: 'start', description: 'Main menu' },
        { command: 'markets', description: 'Go to markets' },
        { command: 'positions', description: 'Overview of all your holdings' },
        { command: 'openorders', description: 'Your open orders' },
        { command: 'history', description: 'All your trading history' },
        { command: 'profile', description: 'View your profile and assets' },
    ]);

    // 处理 命令
    bot.command('markets', (ctx) => {
        showCategoryList(bot, ctx);
    });
    bot.command('positions', (ctx) => {
        showPositions(ctx);
    });
    bot.command('openorders', (ctx) => {
        showOpenOrders(ctx);
    });
    bot.command('history', (ctx) => {
        showHistory(ctx);
    });
    bot.command('profile', (ctx) => {
        showProfile(ctx);
    });
}