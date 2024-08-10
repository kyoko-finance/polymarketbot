import { ClobClient } from "@polymarket/clob-client";
import { ethers } from "ethers";
import 'dotenv/config';
import axios from "axios";


async function getCategory() {
    const category = await axios.get('https://polymarket.com/api/profile/positions?user=0x10093a40AeB323301fB0731230cA1b7ac075FF70');
    console.log(`category: `);
    var data = category.data;
    console.log(data);
}

getCategory();