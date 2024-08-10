import { ethers } from "ethers";
import 'dotenv/config';
import { initClobClientEOA, initClobClientEmail, initClobClientGnosis } from '../../clobClientInit';


async function main() {
    const clobClient = initClobClientGnosis();

    console.log(
        await clobClient.getLastTradePrice(
            "67651190137384692436254313465446414883079283131079052933923486306417976524160", // NO
        ),
    );
    console.log(
        await clobClient.getLastTradePrice(
            "67651190137384692436254313465446414883079283131079052933923486306417976524160", // YES
        ),
    );
}

main();
