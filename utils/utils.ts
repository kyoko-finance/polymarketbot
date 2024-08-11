import { BigNumber, ethers, Wallet } from 'ethers';


export function generateRandomPrivateKey() {
    const wallet = Wallet.createRandom();
    const address = wallet.address;
    const privateKey = wallet.privateKey;
    console.log('Generated address:', address);
    console.log('Generated Private Key:', privateKey);
    return { address, privateKey };
}

export function formatUSDC(usdcAmount: BigNumber) {
    var scaledValue = usdcAmount.mul(1000).div(BigNumber.from(1000000));
    const roundedValue = scaledValue.add(5).div(10);
    const numberValue = parseFloat(ethers.utils.formatUnits(roundedValue, 2));
    // console.log("formatUSDC:", numberValue)
    return numberValue;
}

export function formatUSDCToString(usdcAmount: BigNumber) {
    var scaledValue = usdcAmount.mul(1000).div(BigNumber.from(1000000));
    const roundedValue = scaledValue.add(5).div(10);
    const numberValue = ethers.utils.formatUnits(roundedValue, 2)
    // console.log('formatUSDCToString:', numberValue)
    return numberValue;
}
