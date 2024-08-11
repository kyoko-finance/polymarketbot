import { ClobClient } from "@polymarket/clob-client";
import { ethers } from "ethers";
import 'dotenv/config';
import axios from "axios";


async function getPortfolio() {
    const portfolio = await axios.get('https://polymarket.com/api/profile/positions-value?user=0x78eF948456cD33bB821d73078BAC36bd51EB455b');
    console.log(`portfolio: `);
    console.log(portfolio.data);
}

getPortfolio();


async function getPositions() {
    const category = await axios.get('https://polymarket.com/api/profile/positions?user=0x78eF948456cD33bB821d73078BAC36bd51EB455b');
    console.log(`category: `);
    var data = category.data;
    console.log(data);
}

// getPositions();


async function getHistory() {
    const user = '0x78eF948456cD33bB821d73078BAC36bd51EB455b';
    const category = await axios.get(`https://data-api.polymarket.com/activity?user=${user}&limit=100&offset=0&start=1601481600&end=2722960000&sortBy=TIMESTAMP&sortDirection=DESC`);
    console.log(`category: `);
    var data = category.data;
    console.log(data);
}

// getHistory();