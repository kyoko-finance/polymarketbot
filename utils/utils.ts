import { BigNumber, ethers, Wallet } from 'ethers';
import { IMarket } from '../pages/eventList';


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

export function formatTimestampToString(timestamp: number): string {
    const now = Math.floor(Date.now() / 1000); // 当前时间的秒级时间戳
    const diffInSeconds = now - timestamp; // 时间差（秒）

    if (diffInSeconds < 60) {
        return 'less than a minute ago';
    } else if (diffInSeconds < 3600) { // Less than 1 hour
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) { // Less than 1 day
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 31536000) { // Less than 1 year
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        const years = Math.floor(diffInSeconds / 31536000);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    }
}


export function omitTxhash(tx: string): string {
    if (tx.length <= 16) {
        return tx;
    }

    const firstPart = tx.slice(0, 8); // 取前8位
    const lastPart = tx.slice(-8);    // 取后8位

    return `${firstPart}...${lastPart}`;
}


export function formatExpiration(timestamp: string): string {
    const timeNumber = parseInt(timestamp, 10);

    if (timeNumber === 0) {
        return 'Until Cancelled';
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeDifference = timeNumber - currentTime;

    if (timeDifference <= 0) {
        return 'Time already passed';
    }

    const hours = Math.floor(timeDifference / 3600);
    const days = Math.floor(timeDifference / (24 * 3600));

    if (days >= 1) {
        return `In ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours >= 1) {
        return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
        return 'Less than an hour';
    }
}


export function formatVolume(volume: number): string {
    // console.log("volume:", volume);
    try {
        if(!volume) {
            return '\\-'
        }
        if (volume >= 1_000_000_000) {
            return (volume / 1_000_000_000).toFixed(1) + 'b';
        } else if (volume >= 1_000_000) {
            return (volume / 1_000_000).toFixed(1) + 'm';
        } else if (volume >= 1_000) {
            return (volume / 1_000).toFixed(1) + 'k';
        } else {
            return volume.toFixed(1);
        } 
    }catch(error) {
        return volume.toString();
    }
    
}

/**
 * 对marketList按照bestAsk降序排列，如果相等则按照volume降序排列
 * @param marketList 
 */
export function sortMarket(marketList: IMarket[]) {
    marketList.sort((a, b) => {
        if (b.bestAsk !== a.bestAsk) {
            return b.bestAsk - a.bestAsk;
        }
        return parseFloat(b.volume) - parseFloat(a.volume);
    })
}

export function formatString(value: string) {
    if(!value || value.length == 0) {
        return value;
    }
    try {
        return value.replace(/\./g, '\\.').replace(/\-/g, '\\-').replace(/\#/g, '\\#');
    }catch(error) {
        console.log('format string error');
        return value;
    }
}