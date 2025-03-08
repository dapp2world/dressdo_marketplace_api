const { ethers } = require("ethers");

const Account = require("../models/account");

const toLowerCase = require("../utils/utils");

const validateSignature = async (publicKey, signature, retrievedAddr) => {
  try {
    publicKey = toLowerCase(publicKey);
    retrievedAddr = toLowerCase(retrievedAddr);
    let account = await Account.findOne({ address: publicKey });
    let nonce = account.nonce;
    let msg = `Approve Signature on Dress.Dio with nonce ${nonce}`;
    let msgHash = ethers.hashMessage(msg);

    let parsedSignature = JSON.parse(signature);
    let r = parsedSignature.sig_list[0].r;
    let s = parsedSignature.sig_list[0].s;
    let v = parsedSignature.sig_list[0].vsource;

    let address = ethers.recoverAddress(msgHash, { r, s, v });

    if (toLowerCase(address) == publicKey) {
      account.nonce = Math.floor(Math.random() * 9999999);
      await account.save();
      return true;
    } else if (toLowerCase(address) == retrievedAddr) {
      account.nonce = Math.floor(Math.random() * 9999999);
      await account.save();
      return true;
    } else return false;
  } catch (error) {
    return false;
  }
};

module.exports = validateSignature;
