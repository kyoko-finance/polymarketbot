import { ethers, BigNumber } from "ethers";
import { Interface } from "ethers/lib/utils";
import { erc20Abi } from "./erc20Abi";
import { proxyFactoryAbi } from "./proxyFactoryAbi";


const ERC20_INTERFACE = new Interface(erc20Abi);


export const encodeErc20Transfer = (to: string, value: BigNumber): string => {
    return ERC20_INTERFACE.encodeFunctionData(
        "transfer(address,uint256)",
        [to, value]
    );
}

async function main() {
    console.log(`Starting...`);
    
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon.llamarpc.com`);
    const pk = new ethers.Wallet(``);
    const wallet = pk.connect(provider);

    // Proxy factory
    const factory = new ethers.Contract('0xaB45c5A4B0c941a2F231C04C3f49182e1A254052', proxyFactoryAbi, wallet);

    console.log(`Address: ${wallet.address}`)

    // =============== Replace the values below with your values ==========================
    const to = "0x8B234F3EACc90Ee5b143E5DD6499A45D6A7508AC"; // Replace with your destination address
    const value = ethers.utils.parseUnits("1", 6); // Replace with your transfer value
    
    // Transfers an ERC20 token out of the proxy wallet to the destination address
    const data = encodeErc20Transfer(to, value);
    
    const proxyTxn = {
        to: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        typeCode: "1",
        data: data,
        value: "0",
    };

    const txn = await factory.proxy([proxyTxn], { gasPrice: 100000000000 });
    
    console.log(`Txn hash: ${txn.hash}`);
    await txn.wait();

    console.log(`Done!`)
}

main();