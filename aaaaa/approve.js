const { ethers } = require("ethers");


const transactions = [
    {
        "to": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        "data": "0x095ea7b30000000000000000000000004d97dcd97ec945f40cf65f87097ace5ea0476045ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "value": "0",
        "operation": 0
    },
    {
        "to": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        "data": "0x095ea7b30000000000000000000000004bfb41d5b3570defd03c39a9a4d8de6bd8b8982effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "value": "0",
        "operation": 0
    },
    {
        "to": "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045",
        "data": "0xa22cb4650000000000000000000000004bfb41d5b3570defd03c39a9a4d8de6bd8b8982e0000000000000000000000000000000000000000000000000000000000000001",
        "value": "0",
        "operation": 0
    },
    {
        "to": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        "data": "0x095ea7b3000000000000000000000000c5d563a36ae78145c45a50134d48a1215220f80affffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "value": "0",
        "operation": 0
    },
    {
        "to": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        "data": "0x095ea7b3000000000000000000000000d91e80cf2e7be2e162c6513ced06f1dd0da35296ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "value": "0",
        "operation": 0
    },
    {
        "to": "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045",
        "data": "0xa22cb465000000000000000000000000c5d563a36ae78145c45a50134d48a1215220f80a0000000000000000000000000000000000000000000000000000000000000001",
        "value": "0",
        "operation": 0
    },
    {
        "to": "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045",
        "data": "0xa22cb465000000000000000000000000d91e80cf2e7be2e162c6513ced06f1dd0da352960000000000000000000000000000000000000000000000000000000000000001",
        "value": "0",
        "operation": 0
    }
]



const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
const wallet = new ethers.Wallet("", provider);

const message = ethers.utils.defaultAbiCoder.encode(['uint256', 'uint256', 'uint8'], [
    ethers.constants.AddressZero,
    0,
    ethers.constants.AddressZero
])

const sig = await wallet.signMessage(message);
//   console.log(sig);



var result = {
    from: '0x775e44556c5419C4F4aa6B3291B1140824f26C7C',
    to: '0xa238cbeb142c10ef7ad8442c6d1f9e89e07e7761',
    proxyWallet: '0xCE630aB72c290BD8eB298C4a2070cC0365F2880E',
    data: eu.data,
    nonce: 0,
    signature: eN,
    signatureParams: { "gasPrice": "0", "operation": "1", "safeTxnGas": "0", "baseGas": "0", "gasToken": "0x0000000000000000000000000000000000000000", "refundReceiver": "0x0000000000000000000000000000000000000000" },
    type: 'SAFE'
}