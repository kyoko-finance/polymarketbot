import { DBConnect, getInstance } from "../utils/db";
import UserInfo from "./UserInfo";

async function main() {
    await DBConnect();
    await new UserInfo({
        _id: '22222',
        userAddress: '22222',
        clobApiKey: '33333',
        clobSecret: '44444',
        clobPassPhrase: '555555',
    }).save();
    console.log('保存成功')
}

main();