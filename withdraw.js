const { ethers } = require("ethers");
 require('dotenv/config');
const axios = require("axios");
const BigNumber = require("bignumber.js");
const {JsonRpcProvider} = require('@ethersproject/providers')


const contractABI = [
    "event AddedOwner(address owner)",
    "event ApproveHash(bytes32 indexed approvedHash, address indexed owner)",
    "event ChangedFallbackHandler(address handler)",
    "event ChangedGuard(address guard)",
    "event ChangedThreshold(uint256 threshold)",
    "event DisabledModule(address module)",
    "event EnabledModule(address module)",
    "event ExecutionFailure(bytes32 txHash, uint256 payment)",
    "event ExecutionFromModuleFailure(address indexed module)",
    "event ExecutionFromModuleSuccess(address indexed module)",
    "event ExecutionSuccess(bytes32 txHash, uint256 payment)",
    "event RemovedOwner(address owner)",
    "event SafeModuleTransaction(address module, address to, uint256 value, bytes data, uint8 operation)",
    "event SafeMultiSigTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes signatures, bytes additionalInfo)",
    "event SafeReceived(address indexed sender, uint256 value)",
    "event SafeSetup(address indexed initiator, address[] owners, uint256 threshold, address initializer, address fallbackHandler)",
    "event SignMsg(bytes32 indexed msgHash)",
    "function VERSION() view returns (string)",
    "function addOwnerWithThreshold(address owner, uint256 _threshold)",
    "function approveHash(bytes32 hashToApprove)",
    "function approvedHashes(address, bytes32) view returns (uint256)",
    "function changeThreshold(uint256 _threshold)",
    "function checkNSignatures(bytes32 dataHash, bytes data, bytes signatures, uint256 requiredSignatures) view",
    "function checkSignatures(bytes32 dataHash, bytes data, bytes signatures) view",
    "function disableModule(address prevModule, address module)",
    "function domainSeparator() view returns (bytes32)",
    "function enableModule(address module)",
    "function encodeTransactionData(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, uint256 _nonce) view returns (bytes)",
    "function execTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes signatures) payable returns (bool)",
    "function execTransactionFromModule(address to, uint256 value, bytes data, uint8 operation) returns (bool success)",
    "function execTransactionFromModuleReturnData(address to, uint256 value, bytes data, uint8 operation) returns (bool success, bytes returnData)",
    "function getChainId() view returns (uint256)",
    "function getModulesPaginated(address start, uint256 pageSize) view returns (address[] array, address next)",
    "function getOwners() view returns (address[])",
    "function getStorageAt(uint256 offset, uint256 length) view returns (bytes)",
    "function getThreshold() view returns (uint256)",
    "function getTransactionHash(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, uint256 _nonce) view returns (bytes32)",
    "function isModuleEnabled(address module) view returns (bool)",
    "function isOwner(address owner) view returns (bool)",
    "function nonce() view returns (uint256)",
    "function removeOwner(address prevOwner, address owner, uint256 _threshold)",
    "function requiredTxGas(address to, uint256 value, bytes data, uint8 operation) returns (uint256)",
    "function setFallbackHandler(address handler)",
    "function setGuard(address guard)",
    "function setup(address[] _owners, uint256 _threshold, address to, bytes data, address fallbackHandler, address paymentToken, uint256 payment, address paymentReceiver)",
    "function signedMessages(bytes32) view returns (uint256)",
    "function simulateAndRevert(address targetContract, bytes calldataPayload)",
    "function swapOwner(address prevOwner, address oldOwner, address newOwner)"
  ]

const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');
const provider2 = new JsonRpcProvider('https://polygon.llamarpc.com')

console.log(1111)
let contract = new ethers.Contract('0x10093a40AeB323301fB0731230cA1b7ac075FF70',
    contractABI, provider);
console.log(222)
const signer = new ethers.Wallet('',
    provider);
console.log(333)

async function computeNonce(et, eo, eu) {
    // if (0 === eu) {
    //     let eu = await et.call("nonce", []);
    //     return eX.O$.from(null != eo ? eo : 0).add(eu)
    // }
    // return eX.O$.from(eu)
    return 0;
}
function signMessage(et, k) {
    let eo = ethers.utils.arrayify(et);
    return signer.signMessage(eo)
}


async function signTransactionHash(eo, eu) {
    let ep = await signMessage(eu, eo)
        , em = parseInt(ep.slice(-2), 16);
    switch (em) {
        case 0:
        case 1:
            em += 31;
            break;
        case 27:
        case 28:
            em += 4;
            break;
        default:
            throw Error("Invalid signature")
    }
    return ep = ep.slice(0, -2) + em.toString(16),
    {
        r: new BigNumber("0x" + ep.slice(2, 66)).toString(10),
        s: new BigNumber("0x" + ep.slice(66, 130)).toString(10),
        v: new BigNumber("0x" + ep.slice(130, 132)).toString(10)
    }
}

const e5 = function (et, eo) {
    var eu = {};
    for (var ep in et)
        Object.prototype.hasOwnProperty.call(et, ep) && 0 > eo.indexOf(ep) && (eu[ep] = et[ep]);
    if (null != et && "function" == typeof Object.getOwnPropertySymbols)
        for (var em = 0, ep = Object.getOwnPropertySymbols(et); em < ep.length; em++)
            0 > eo.indexOf(ep[em]) && Object.prototype.propertyIsEnumerable.call(et, ep[em]) && (eu[ep[em]] = et[ep[em]]);
    return eu
};

function e9(et) {
    let { gas: eo, gasLimit: eu } = et
        , ep = e5(et, ["gas", "gasLimit"]);
    if (null != eo && null != eu)
        throw Error(`specified both gas and gasLimit on options: ${et}`);
    return Object.assign(Object.assign({}, ep), {
        gas: eo || eu
    })
}

function eJ(et) {
    return `0x${Number(et.toString()).toString(16)}`
}
function e7(et) {
    let { from: eo, to: eu, value: ep, data: em, gas: ey } = e9(et);
    debugger
    return {
        from: eo,
        to: eu,
        value: ep ? eJ(ep) : void 0,
        data: em,
        gas: ey ? eJ(ey) : void 0
    }
}

async function ethCall(et, eo) {
    return provider2.send("eth_call", [e7(et), eo])
}

async function getTransactionHash(eo, eu) {
    const et = 'getTransactionHash'
    let ep = contract.interface.encodeFunctionData(et, eo)
        , em = await ethCall(Object.assign(Object.assign({}, eu), {
            to: '0x10093a40AeB323301fB0731230cA1b7ac075FF70',
            data: ep
        }), "latest")
        , ey = contract.interface.decodeFunctionResult(et, em);

        console.log(ey)
    return 1 === ey.length ? ey[0] : ey
}

const ey = '0xaacFeEa03eb1561C4e67d661e40682Bd20E3541b'


async function generateSignature(ep, ownerAddress) {

    let eA = await computeNonce(contract, 0, 0)
        , eT = "0"
        , eM = "0"
        , eC = "0"
        , eP = ethers.constants.AddressZero
        , eO = ethers.constants.AddressZero
        , eI = await getTransactionHash([ep.to, ep.value, ep.data, ep.operation, eT, eM, eC, eP, eO, eA])
        , eR = await signTransactionHash(ownerAddress, eI)

        return eI
}

//eI 0xc906fef89900f321432d00150a577aefe7d8b327194d4d258c4c9cb447d0f320

async function createProxy(_to, _amount) {
    const data = `0xa9059cbb${ethers.utils.defaultAbiCoder.encode(['address', 'uint'], [_to, _amount]).substring(2)}`
    const market = await axios.post('https://matic-gsn-v2-1.polymarket.io/relay-safe-tx', {
        baseGas: '0',
        data: data,
        gasPrice: '0',
        gasToken: '0x0000000000000000000000000000000000000000',
        operation: '0',
        refundReceiver: '0x0000000000000000000000000000000000000000',
        safe: '0x10093a40AeB323301fB0731230cA1b7ac075FF70',
        safeTxGas: '0',
        signatures: await generateSignature({
            to: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            value: '0',
            data: data
        }, '0x78eF948456cD33bB821d73078BAC36bd51EB455b'),
        to: _to,
        value: '0',
    });
    console.log(`proxy: `);
    console.log(market);
}

function to64HexString(address) {
    // 去掉地址的 '0x' 前缀
    const addressWithoutPrefix = address.toLowerCase().replace(/^0x/, '');

    // 将地址填充到64个字符
    const paddedAddress = addressWithoutPrefix.padStart(64, '0');

    return `0x${paddedAddress}`;
}

// createProxy('0xf13DD9e447708c31785E947191183750e0F2DB14', 1500000);


async function main() {
    try {
        var _to = '0xf13DD9e447708c31785E947191183750e0F2DB14';
        var _amount = 1000000;
        const data = `0xa9059cbb${ethers.utils.defaultAbiCoder.encode(['address', 'uint'], [_to, _amount]).substring(2)}`
        var sign = await generateSignature({
            to: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            value: '0',
            data: data,
            operation: 0
        }, '0x78eF948456cD33bB821d73078BAC36bd51EB455b');
        console.log('sign:', sign);
    } catch (e) {
        console.error(2111, e)
    }

}




process.on('uncaughtException',(e) => {
    console.error('22222', e)
})


main();