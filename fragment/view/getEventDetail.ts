import { ClobClient } from "@polymarket/clob-client";
import { BigNumber, ethers } from "ethers";
import 'dotenv/config';
import axios from "axios";


async function getCategory() {
    const category = await axios.get('https://gamma-api.polymarket.com/events?limit=10&active=true&archived=false&tag_slug=us-election&closed=false&order=volume24hr&ascending=false&offset=0');
    console.log(`category: `);
    var list: IEvent[] = category.data;
    // console.log(list);
    // console.log("##########")
    // console.log(list[1].markets.length);
    console.log(list[0].markets[0]);
    var sampleMarketList: IMarket[] = list[0].markets;
    console.log("22222222");
    // console.log(list[0].markets[0]);
    // sortMarket(sampleMarketList);
    for(var i=0;i<sampleMarketList.length;i++) {
        // console.log(sampleMarketList[i].groupItemTitle,",", sampleMarketList[i].bestAsk, ",", sampleMarketList[i].liquidity, ",", sampleMarketList[i].volume);
    }
}

function sortMarket(marketList: IMarket[]) {
    marketList.sort((a, b) => {
        if (b.bestAsk !== a.bestAsk) {
            return b.bestAsk - a.bestAsk;
        }
        return parseFloat(b.volume) - parseFloat(a.volume);
    })
}

interface IEvent {
    id: string;
    ticker: string;
    slug: string;
    title: string;
    description: string;
    image: string;
    icon: string;
    volume: BigNumber;
    volume24hr: number;
    liquidityClob: number;
    commentCount: number;
    markets: IMarket[];
}

interface IMarket {
    id: string;
    question: string;
    conditionId: string;
    slug: string;
    liquidity: string;
    groupItemTitle: string;
    image: string;
    icon: string;
    outcomes: string;
    volume: string;
    volumeNum: number;
    liquidityNum: number;
    orderMinSize: string;
    volume24hr: string;
    clobTokenIds: string;
    spread: number;
    oneDayPriceChange: number;
    lastTradePrice: number;
    bestBid: number;
    bestAsk: number;
}

getCategory();