const { ethers } = require("ethers");
require('dotenv').config();


async function main() {
  var host = 'https://clob.polymarket.com/';
  const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
  const wallet = new ethers.Wallet('04c892bade3194a1c1515eac063ddbc06f34ee56b2d6f615e216260c21845a8c', provider);
  


  const domain = {
    verifyingContract: '0xaacfeea03eb1561c4e67d661e40682bd20e3541b',
    name: "Polymarket Contract Proxy Factory",
    chainId: '137', // Polygon ChainID 137
  };

  const types = {
    CreateProxy: [
      { name: "paymentToken", type: "address" },
      { name: "payment", type: "uint256" },
      { name: "paymentReceiver", type: "address" }
    ],
  };
  const value = {
    paymentToken: '0x0000000000000000000000000000000000000000', // the Signing address
    payment: 0, // The CLOB API server timestamp
    paymentReceiver: '0x0000000000000000000000000000000000000000' // The nonce used
  };
  const sig = await wallet._signTypedData(domain, types, value);


  console.log(sig);
}

main()