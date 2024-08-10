import { ClobClient } from "@polymarket/clob-client";
import { ethers } from "ethers";
import 'dotenv/config';
import axios from "axios";


async function getCategory() {
    const category = await axios.get('https://polymarket.com/api/tags/filtered?tag=100221&status=active');
    console.log(`category: `);
    console.log(category.data);
}

getCategory();