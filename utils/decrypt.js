/** @format */

const crypto = require("crypto");
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

let client;
if (process.env.ENV_DEV != '1') {
    client = new SecretsManagerClient({ region: "us-west-2" });
}

function encryptData(data, keyStr, ivStr) {
    const iv = Buffer.from(ivStr, "base64");
    const key = Buffer.from(keyStr, "base64");

    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    let encryptedData = cipher.update(data, "utf-8", "base64");
    encryptedData += cipher.final("base64");

    return encryptedData;
}

function decryptData(data, keyStr, ivStr) {
    const iv = Buffer.from(ivStr, "base64");
    const key = Buffer.from(keyStr, "base64");

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    let decryptedData = decipher.update(data, "base64", "utf-8");
    decryptedData += decipher.final("utf-8");

    return decryptedData;
}

async function readKeysFromAws() {
    let config;
    if (process.env.ENV_DEV == '1') {
        config = {
            iv: process.env.IV,
            symmetricKey: process.env.SYMMETRICKEY
        }
    } else {
        const params = { SecretId: "bot-security" };
        const command = new GetSecretValueCommand(params);

        const res = await client.send(command);
        config = JSON.parse(res.SecretString);
    }

    const { iv, symmetricKey } = config;

    return { iv, symmetricKey };
}

async function encryptUserPrivateKey(data) {
    const { iv, symmetricKey } = await readKeysFromAws();

    return encryptData(data, symmetricKey, iv);
}

async function decryptUserPrivateKey(data) {
    const { iv, symmetricKey } = await readKeysFromAws();

    return decryptData(data, symmetricKey, iv);
}

module.exports = {
    encryptUserPrivateKey,
    decryptUserPrivateKey,
    encryptData,
    decryptData,
};
