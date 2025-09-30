import mongoose, { Mongoose } from 'mongoose';
import UserInfo, { IUserInfo } from '../schema/UserInfo';
import { decryptUserPrivateKey } from './decrypt';
import 'dotenv/config';

// 声明一个变量来存储 Mongoose 实例
let DBInstance: Mongoose | null = null;

const CAPath = process.env.CA;

const remoteUrl = process.env.REMOTE_URL as string; // 你可以在这里替换为实际的数据库URL
console.log("mongoose remoteUrl:", remoteUrl);
let options = {
    socketTimeoutMS: 4 * 1000,
}; // 你的连接选项

if (CAPath) {
    options = Object.assign({}, options, {
        tls: true,
        tlsCAFile: CAPath,
    });
}

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
    let privateKey = await decryptUserPrivateKey(userInfo.userPrivatekey);
    userInfo.userPrivatekey = privateKey;
    console.log("queryUserInfo结果:", userInfo)
    return userInfo;
}