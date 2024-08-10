import { DBConnect, getInstance } from "../utils/db";
import UserInfo from "./UserInfo";

async function main() {
    await DBConnect();
    var userInfo = await UserInfo.findById('111111');
    console.log(typeof userInfo)
    console.log("----------------")
    if(userInfo == null) {
        return
    }
    // if(userInfo) {
    //     userInfo.clobSecret = '888888';
    //     userInfo.save();
    // }
    console.log(userInfo)
}

main();