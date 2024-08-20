import { BigNumber, constants, ethers } from "ethers";
import { ClobClient, getContractConfig } from "@polymarket/clob-client";
import { usdcAbi } from "../abi/usdcAbi";
import { ctfAbi } from "../abi/ctfAbi";
import 'dotenv/config';
import { queryUserInfo } from "../utils/db";
import { Context } from "telegraf";
import UserInfo from "../schema/UserInfo";


const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);

function getUsdcContract(chainId: number, wallet: ethers.Wallet): ethers.Contract {
    const contractConfig = getContractConfig(chainId);
    return new ethers.Contract(contractConfig.collateral, usdcAbi, wallet);
}

function getCtfContract(chainId: number, wallet: ethers.Wallet): ethers.Contract {
    const contractConfig = getContractConfig(chainId);
    return new ethers.Contract(contractConfig.conditionalTokens, ctfAbi, wallet);
}

export async function approveAllowance(ctx: Context) {
    try {
        var userInfo = await queryUserInfo(ctx.from!.id.toString());
        if (!userInfo) {
            return false;
        }
        const wallet = new ethers.Wallet(userInfo.userPrivatekey, provider);
        const chainId = await wallet.getChainId();
        console.log(`Address: ${await wallet.getAddress()}, chainId: ${chainId}`);

        const contractConfig = getContractConfig(chainId);

        const usdc = getUsdcContract(chainId, wallet);
        const ctf = getCtfContract(chainId, wallet);

        //usdc:0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
        console.log(`usdc: ${usdc.address}`);
        //ctf:0x4D97DCd97eC945f40cF65F87097ACe5EA0476045
        console.log(`ctf: ${ctf.address}`);
        //exchange:0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E
        console.log(`exchange:${contractConfig.exchange}`)

        console.log("更新之前：", userInfo.approved);

        const usdcAllowanceCtf = (await usdc.allowance(wallet.address, ctf.address)) as BigNumber;
        console.log(`usdcAllowanceCtf: ${usdcAllowanceCtf}`);

        const usdcAllowanceExchange = (await usdc.allowance(
            wallet.address,
            contractConfig.exchange,
        )) as BigNumber;
        console.log(`usdcAllowanceExchange:${usdcAllowanceExchange}`)

        const conditionalTokensAllowanceExchange = (await ctf.isApprovedForAll(
            wallet.address,
            contractConfig.exchange,
        )) as BigNumber;
        console.log(`conditionalTokensAllowanceExchange:${conditionalTokensAllowanceExchange}`);

        let txn;

        let gasPrice = await getGasPrice();

        if (!usdcAllowanceCtf.gt(constants.Zero)) {
            console.log('approve usdcAllowanceCtf')
            txn = await usdc.approve(contractConfig.conditionalTokens, constants.MaxUint256, {
                gasPrice: gasPrice,
                gasLimit: 200_000,
            });
            console.log(`Setting USDC allowance for CTF: ${txn.hash}`);
        }
        if (!usdcAllowanceExchange.gt(constants.Zero)) {
            console.log('approve usdcAllowanceExchange')
            txn = await usdc.approve(contractConfig.exchange, constants.MaxUint256, {
                gasPrice: gasPrice,
                gasLimit: 200_000,
            });
            console.log(`Setting USDC allowance for Exchange: ${txn.hash}`);
        }
        if (!conditionalTokensAllowanceExchange) {
            console.log('approve conditionalTokensAllowanceExchange')
            txn = await ctf.setApprovalForAll(contractConfig.exchange, true, {
                gasPrice: gasPrice,
                gasLimit: 200_000,
            });
            console.log(`Setting Conditional Tokens allowance for Exchange: ${txn.hash}`);
        }
        //update approved
        let result = await UserInfo.findByIdAndUpdate(
            ctx.from!.id.toString(),
            { approved: true },
            { new: true, runValidators: true }
        );
        console.log("Allowances set");
        if(result) {
            console.log('数据库更新成功')
            return true;
        }
        return false;
    } catch (error) {
        // console.log('approveAllowance:', error);
        console.log('approve failed.');
        return false;
    }
}


// 获取当前的 gasPrice
async function getGasPrice() {
    const gasPrice = await provider.getGasPrice();
    console.log(`Current gas price: ${gasPrice.mul(15).div(10)} gwei`);
    return gasPrice.mul(15).div(10);
}

// getGasPrice();