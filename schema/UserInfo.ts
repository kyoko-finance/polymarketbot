import mongoose, { Schema } from 'mongoose'


export interface IUserInfo {
  _id: string;
  userAddress: string;
  userPrivatekey: string;
  clobApiKey: string;
  clobSecret: string;
  clobPassPhrase: string;
  proxyWallet: string;
  approved: boolean;
  generateProxyWallet: boolean;
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
  approved: Boolean,
  generateProxyWallet: Boolean
});


export default mongoose.model<IUserInfo>('UserInfo', UserInfoSchema, 'UserInfo')