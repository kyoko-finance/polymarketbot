import { ClobClient } from "@polymarket/clob-client";
import { ethers } from "ethers";
import 'dotenv/config';
import axios from "axios";


async function getCategory() {
    const category = await axios.get('https://gamma-api.polymarket.com/events?limit=20&active=true&archived=false&tag_slug=us-election&closed=false&order=volume24hr&ascending=false&offset=0');
    console.log(`category: `);
    var list = category.data;
    // console.log(list);
    // console.log("##########")
    // console.log(list[1].markets.length);
    console.log((list[0].markets)[0]);
}

getCategory();