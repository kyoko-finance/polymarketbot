import { DBConnect, getInstance } from "../utils/db";
import UserInfo from "./UserInfo";

async function main() {
    await DBConnect();
    await new UserInfo({
        _id: '2003734514',
        userAddress: '0x0dFcF5dF949d2ac74d29EFb8f28045524Dc46815',
        userPrivatekey: '',
        clobApiKey: '07650fe9-e062-9465-d4ee-eb8b796f534a',
        clobSecret: 'dZnHAxJCl6hxbA5_5AKjm-77J8BvrX3ghtN-6KqM7P0=',
        clobPassPhrase: '5d31b389fa15d97c548baff0ea6bc8fb8933b5c202bd28a9032da3491070a69d',
        proxyWallet: '0x5850707E886Eb0E53Da3C684581E3b8B2d9AC6Cb',
        approved: true,
    }).save();
    console.log('保存成功')
}

main();