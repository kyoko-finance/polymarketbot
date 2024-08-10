import { ethers } from "ethers";
import { JsonRpcProvider } from '@ethersproject/providers';
import 'dotenv/config';
import axios from "axios";


async function generateSignature(privateKey: string) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);
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

export async function createProxyWallet(address: string, privateKey: string) {
  const proxyWallet = await axios.post('https://matic-gsn-v2-2.polymarket.io/create-safe-proxy', {
    paymentToken: '0x0000000000000000000000000000000000000000',
    payment: '0x00',
    paymentReceiver: '0x0000000000000000000000000000000000000000',
    signature: await generateSignature(privateKey)
  });
  // console.log(proxyWallet);
  if (proxyWallet.status == 200) {
    return await queryProxyWallet(address);
  }
}


async function queryProxyWallet(address: string) {
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