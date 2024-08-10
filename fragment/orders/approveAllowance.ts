import { BigNumber, constants, ethers } from "ethers";
import { ClobClient, getContractConfig } from "@polymarket/clob-client";
import { usdcAbi } from "../../abi/usdcAbi";
import { ctfAbi } from "../../abi/ctfAbi";
import 'dotenv/config';


const host = 'https://clob.polymarket.com/';
const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);


function getUsdcContract(chainId: number, wallet: ethers.Wallet): ethers.Contract {
    const contractConfig = getContractConfig(chainId);
    return new ethers.Contract(contractConfig.collateral, usdcAbi, wallet);
}

function getCtfContract(chainId: number, wallet: ethers.Wallet): ethers.Contract {
    const contractConfig = getContractConfig(chainId);
    return new ethers.Contract(contractConfig.conditionalTokens, ctfAbi, wallet);
}

async function main() {
    const chainId = await wallet.getChainId();

    // console.log("完成授权后");

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

    if (!usdcAllowanceCtf.gt(constants.Zero)) {
        console.log('来这里了,first')
        txn = await usdc.approve(contractConfig.conditionalTokens, constants.MaxUint256, {
            gasPrice: 100_000_000_000,
            gasLimit: 200_000,
        });
        console.log(`Setting USDC allowance for CTF: ${txn.hash}`);
    }
    if (!usdcAllowanceExchange.gt(constants.Zero)) {
        console.log('来这里了')
        txn = await usdc.approve(contractConfig.exchange, constants.MaxUint256, {
            gasPrice: 100_000_000_000,
            gasLimit: 200_000,
        });
        console.log(`Setting USDC allowance for Exchange: ${txn.hash}`);
    }
    if (!conditionalTokensAllowanceExchange) {
        console.log('来这里了22222')
        txn = await ctf.setApprovalForAll(contractConfig.exchange, true, {
            gasPrice: 100_000_000_000,
            gasLimit: 200_000,
        });
        console.log(`Setting Conditional Tokens allowance for Exchange: ${txn.hash}`);
    }
    console.log("Allowances set");
}

main();
