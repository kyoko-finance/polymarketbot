import mongoose, { Schema } from 'mongoose'


export interface IUserInfo {
  _id: string;
  userAddress: string;
  userPrivatekey: string;
  clobApiKey: string;
  clobSecret: string;
  clobPassPhrase: string;
  proxyWallet: string;
}

const UserInfoSchema: Schema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  userAddress: String,
  userPrivatekey: String,
  clobApiKey: String,
  clobSecret: String,
  clobPassPhrase: String,
  proxyWallet: String,
});


export default mongoose.model<IUserInfo>('UserInfo', UserInfoSchema, 'UserInfo')