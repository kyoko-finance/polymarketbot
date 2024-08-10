import mongoose, { Schema } from 'mongoose'

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


export default mongoose.model('UserInfo', UserInfoSchema, 'UserInfo')