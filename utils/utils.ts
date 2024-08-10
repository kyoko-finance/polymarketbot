import { Wallet } from 'ethers';


export function generateRandomPrivateKey() {
    const wallet = Wallet.createRandom();
    const address = wallet.address;
    const privateKey = wallet.privateKey;
    console.log('Generated address:', address);
    console.log('Generated Private Key:', privateKey);
    return { address, privateKey };
}