import { ClobClient } from "@polymarket/clob-client";
import { ethers } from "ethers";
import 'dotenv/config';
import axios from "axios";


async function getCategory() {
    const market = await axios.get('https://polymarket.com/api/tags/filteredBySlug?tag=all&status=active');
    console.log(`market: `);
    console.log(market.data);
}

getCategory();