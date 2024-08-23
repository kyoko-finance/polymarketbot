const { ethers } = require('ethers');

// 配置Polygon网络的provider
const provider = new ethers.providers.JsonRpcProvider('https://polygon-bor-rpc.publicnode.com');

// 发送方的私钥（确保安全保管）
const senderPrivateKey = '';
const senderWallet = new ethers.Wallet(senderPrivateKey, provider);

// 接收方地址
const recipientAddress = '0x78eF948456cD33bB821d73078BAC36bd51EB455b';

// 主函数
async function transferAllMatic() {
    // 获取发送方的余额
    const balance = await senderWallet.getBalance();
    
    console.log(`Sender's balance: ${ethers.utils.formatEther(balance)} MATIC`);

    if (balance.isZero()) {
        console.log('No MATIC to transfer.');
        return;
    }

    // 获取当前的 gas 价格
    const gasPrice = await provider.getGasPrice();

    // 设置 gasLimit 为 21000，这是标准的 MATIC 转账 gas 消耗
    const gasLimit = 21000;

    // 计算总的 gas 费用
    const gasCost = gasPrice.mul(gasLimit);

    // 确保转账后余额为零，转账金额为 (余额 - gasCost)
    const amountToSend = balance.sub(gasCost);

    if (amountToSend.lte(0)) {
        console.log('Insufficient balance to cover gas fees.');
        return;
    }

    // 创建交易对象
    const tx = {
        to: recipientAddress,
        value: amountToSend,
        gasLimit: gasLimit,
        gasPrice: gasPrice
    };

    // 发送交易
    const txnResponse = await senderWallet.sendTransaction(tx);
    console.log(`Transaction sent: ${txnResponse.hash}`);

    // 等待交易确认
    const receipt = await txnResponse.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
}

// 执行转账
transferAllMatic().catch(console.error);