import { ethers } from "ethers";
import { JsonRpcProvider } from '@ethersproject/providers';
import 'dotenv/config';
import axios from "axios";
import UserInfo from "../schema/UserInfo";
import { Context } from "telegraf";

const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);

async function generateSignature(privateKey: string) {
  const wallet = new ethers.Wallet(privateKey, provider);

  const domain = {
    verifyingContract: process.env.GNOSIS_SAFE_FACTORY,
    name: "Polymarket Contract Proxy Factory",
    chainId: process.env.CHAIN_ID, // Polygon ChainID 137
  };

  const types = {
    CreateProxy: [
      { name: "paymentToken", type: "address" },
      { name: "payment", type: "uint256" },
      { name: "paymentReceiver", type: "address" }
    ],
  };
  const value = {
    paymentToken: '0x0000000000000000000000000000000000000000',
    payment: 0,
    paymentReceiver: '0x0000000000000000000000000000000000000000'
  };
  const sig = await wallet._signTypedData(domain, types, value);

  console.log('sig:', sig);
  return sig;
}

export async function createProxyWalletDeprecated(address: string, privateKey: string) {
  try {
    const proxyWallet = await axios.post('https://matic-gsn-v2-2.polymarket.io/create-safe-proxy', {
      paymentToken: '0x0000000000000000000000000000000000000000',
      payment: '0x00',
      paymentReceiver: '0x0000000000000000000000000000000000000000',
      signature: await generateSignature(privateKey)
    });
    console.log("-----------请求结果start-----------------")
    console.log(proxyWallet);
    console.log("-----------请求结果end-----------------")
    if (proxyWallet.status == 200) {
      return await queryProxyWallet(address);
    }
  } catch (error) {
    console.log("创建proxyWallet发生了错误");
    console.log(error);
    console.log("上面是错误内容");
  }
}

export async function getBalance(address: string) {
  const balance = await provider.getBalance(address);
  console.log('balance:' + balance);
  return balance;
}

export async function createProxyWallet(ctx: Context, userId: string, address: string, privateKey: string) {
  try {
    const signer = new ethers.Wallet(privateKey, provider);
    const contractAddress = process.env.GNOSIS_SAFE_FACTORY as string;

    const paymentToken = '0x0000000000000000000000000000000000000000';
    const payment = '0x0';
    const paymentReceiver = '0x0000000000000000000000000000000000000000';

    let pendingMessage = ctx.reply('Approve transaction is pending...');

    const abi = [
      "function createProxy(address paymentToken, uint256 payment, address payable paymentReceiver, (uint8 v, bytes32 r, bytes32 s) createSig) public"
    ];
    const contract = new ethers.Contract(contractAddress, abi, signer);
    // 计算gasPrice, 例如: 设置为50 Gwei
    const gasPrice = await provider.getGasPrice();

    let sig = await generateSignature(privateKey);

    // Split the signature into r, s, and v
    const signature = ethers.utils.splitSignature(sig);
    const createSig = {
      v: signature.v,
      r: signature.r,
      s: signature.s
    };

    const tx = await contract.createProxy(paymentToken, payment, paymentReceiver, createSig, { gasPrice: gasPrice.mul(12).div(10) });
    console.log('Transaction hash:', tx.hash);

    // 等待交易完成
    const receipt = await tx.wait();
    console.log('Transaction was mined in block:', receipt.blockNumber);

    ctx.deleteMessage((await pendingMessage).message_id);
    ctx.reply('Create proxy wallet success.')
    //更新generateProxyWallet
    let result = await UserInfo.findByIdAndUpdate(
      userId,
      { generateProxyWallet: true },
      { new: true, runValidators: true }
    );
    return true;
  } catch (error) {
    console.error('Error calling createProxy:', error);
    return false;
  }
}


export async function queryProxyWallet(address: string) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);

  const abi = [
    'function computeProxyAddress(address user) view returns (address)'
  ];

  const genosisFactoryContract = new ethers.Contract(process.env.GNOSIS_SAFE_FACTORY as string, abi, provider);

  let proxyWallet = await genosisFactoryContract.computeProxyAddress(address);
  // if(!(await isEVMContract(proxyWallet, provider))) {
  //   console.log('proxyWallet is not a contract,', proxyWallet);
  //   return null;
  // }
  console.log('proxyWallet:', proxyWallet);
  return proxyWallet;
}

async function isEVMContract(address: string, provider: JsonRpcProvider) {
  const code = await provider.getCode(address);

  return code && code !== '0x';
}