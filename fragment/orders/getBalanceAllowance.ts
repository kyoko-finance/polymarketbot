import { ethers } from "ethers";
import { ClobClient, AssetType } from "@polymarket/clob-client";
import 'dotenv/config';

async function main() {
    var host = 'https://clob.polymarket.com/';
    const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
    const chainId = await wallet.getChainId();


    const clobClient = new ClobClient(host, chainId, wallet,
        {
            key: process.env.CLOB_API_KEY as string,
            secret: process.env.CLOB_SECRET as string,
            passphrase: process.env.CLOB_PASS_PHRASE as string
        }
    );

    const collateral = await clobClient.getBalanceAllowance({ asset_type: AssetType.COLLATERAL });
    console.log(collateral);

    console.log("&&&&&&&&&&&&&&&&&&&")

    const yes = await clobClient.getBalanceAllowance({
        asset_type: AssetType.CONDITIONAL,
        token_id: "21742633143463906290569050155826241533067272736897614950488156847949938836455",
    });
    console.log(yes);

    console.log("&&&&&&&&&&&&&&&&&&&")

    const no = await clobClient.getBalanceAllowance({
        asset_type: AssetType.CONDITIONAL,
        token_id: "48331043336612883890938759509493159234755048973500640148014422747788308965732",
    });
    console.log(no);
}

main();
