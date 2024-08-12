import mongoose, { Mongoose } from 'mongoose';
import UserInfo, { IUserInfo } from '../schema/UserInfo';

// 声明一个变量来存储 Mongoose 实例
let DBInstance: Mongoose | null = null;

const remoteUrl = 'mongodb://localhost:27017/polymarket_bot'; // 你可以在这里替换为实际的数据库URL
const options = {
    socketTimeoutMS: 4 * 1000,
}; // 你的连接选项

export const DBConnect = async (): Promise<Mongoose> => {
    try {
        await mongoose.connect(remoteUrl, options);
        const { connection } = mongoose;

        connection.on('error', () => {
            console.error('lose database connect', remoteUrl);
        });

        console.log('connect database success');
        DBInstance = mongoose;
        return mongoose;
    } catch (e) {
        console.log('connect failed', e);
        throw e;
    }
};

export const getInstance = (): Mongoose | null => {
    return DBInstance;
};

export async function queryUserInfo(id: string) {
    var userInfo: IUserInfo | null = await UserInfo.findById(id);
    if (userInfo == null) {
        return;
    }
    console.log("queryUserInfo:", userInfo)
    return userInfo;
}