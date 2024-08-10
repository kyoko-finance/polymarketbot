require('dotenv/config');
const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
const wallet = new ethers.Wallet('04c892bade3194a1c1515eac063ddbc06f34ee56b2d6f615e216260c21845a8c', provider);

const message = ethers.utils.defaultAbiCoder.encode(['address', 'uint', 'address'], [
  ethers.constants.AddressZero,
  0,
  ethers.constants.AddressZero
])

async function main() {
  const sig = await wallet.signMessage(message);
  console.log(sig);
}

main()