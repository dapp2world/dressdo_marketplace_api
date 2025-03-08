let service = {};
const logger = require("./logger.js");
let axios = require("axios");
let qs = require("qs");
const Web3 = require("web3");
const web3 = new Web3(process.env.NETWORK_RPC); // Replace with your provider
const { ethers, toBeHex, keccak256 } = require("ethers");

const BASE_URL = process.env.BASEURL;
const authService = require("./auth.js");

// service.signTransaction = async (
//   secureChannel,
//   walletData,
//   transactionData,
//   accessToken
// ) => {
//   let encDP = authService.encrypt(
//     secureChannel,
//     walletData.encryptDevicePassword
//   );
//   let epvencstr = authService.encrypt(secureChannel, walletData.pvencstr);
//   let ewid = authService.encrypt(secureChannel, walletData.wid);
//   let nonce = await web3.eth.getTransactionCount(walletData.sid, "latest");

//   try {
//     let inputData = {
//       network: transactionData.network,
//       encryptDevicePassword: encDP,
//       pvencstr: epvencstr,
//       uid: walletData.uid,
//       wid: ewid,
//       sid: walletData.sid,
//       type: transactionData.type,
//       data: transactionData.data,
//       to: transactionData.to,
//       value: transactionData.value,
//       from: walletData.sid,
//       nonce,
//       // gasLimit: web3.utils.toHex(200000)
//     };

//     const data = qs.stringify(inputData);

//     const response = await axios.post(`${BASE_URL}/wapi/v2/sign`, data, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/x-www-form-urlencoded",
//         "Secure-Channel": secureChannel.ChannelID,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.log(error);
//     throw new Error(`Transaction signing failed: ${error}`);
//   }
// };

service.signTransaction = async (
  secureChannel,
  walletData,
  transactionData,
  accessToken
) => {
  try {
    let nonce = await web3.eth.getTransactionCount(walletData.sid, "pending");

    let gasPrice = await web3.eth.getGasPrice();
    // Estimate gas
    let gasEstimate = 450000;
    try {
      gasEstimate = await web3.eth.estimateGas({
        from: walletData.sid,
        to: transactionData.to,
        data: transactionData.data,
        value: web3.utils.toWei(transactionData.value, "ether"),
      });
      console.log("GAS PRICE: "+gasPrice)
      console.log("GAS ESTIMATE: "+gasEstimate)
    } catch(_) {}
    
    let gasLimit = parseInt(gasEstimate * 1.2); // Adding 20% buffer

    const txArray = [
      nonce == '0' ? "0x" : toBeHex(nonce),
      gasPrice == '0' ? "0x": toBeHex(gasPrice),
      toBeHex(gasLimit),
      transactionData.to,
      transactionData.value == '0' ? "0x" : toBeHex(web3.utils.toWei(transactionData.value, "ether")),
      transactionData.data,
    ];
    console.log(txArray)

    const rlpEncodedTx = ethers.encodeRlp(txArray);

    const txHash = keccak256(rlpEncodedTx);

    let signResult = await service.signHash(
      secureChannel,
      walletData,
      { hash: txHash },
      accessToken
    );

    let signobj = JSON.parse(signResult.signstr);
    console.log(signobj)

    const v = toBeHex(27 + signobj.sig_list[0].vsource); //toBeHex(27); // 27 + vsource + 2 * chainId or 27+vsource
    const r = toBeHex(signobj.sig_list[0].r);
    const s = toBeHex(signobj.sig_list[0].s);

    const signedTxArray = [...txArray, v, r, s];

    const signedRlpEncodedTx = ethers.encodeRlp(signedTxArray);

    // let transactionHash = await service.sendTransaction(signedRlpEncodedTx);
console.log(signedRlpEncodedTx)
    return signedRlpEncodedTx;
  } catch (error) {
    console.log(error);
    throw new Error(`Transaction signing failed: ${error}`);
  }
};

service.signHash = async (
  secureChannel,
  walletData,
  transactionData,
  accessToken
) => {
  let encDP = authService.encrypt(
    secureChannel,
    walletData.encryptDevicePassword
  );
  let epvencstr = authService.encrypt(secureChannel, walletData.pvencstr);
  let ewid = authService.encrypt(secureChannel, walletData.wid);

  try {
    let inputData = {
      encryptDevicePassword: encDP,
      pvencstr: epvencstr,
      uid: walletData.uid,
      wid: ewid,
      sid: walletData.sid,
      hash: transactionData.hash,
    };

    const data = qs.stringify(inputData);

    const response = await axios.post(`${BASE_URL}/wapi/v2/sign/hash`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Secure-Channel": secureChannel.ChannelID,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(`Message signing failed: ${error}`);
  }
};

service.signMessage = async (
  secureChannel,
  walletData,
  transactionData,
  accessToken
) => {
  let encDP = authService.encrypt(
    secureChannel,
    walletData.encryptDevicePassword
  );
  let epvencstr = authService.encrypt(secureChannel, walletData.pvencstr);
  let ewid = authService.encrypt(secureChannel, walletData.wid);

  try {
    let inputData = {
      encryptDevicePassword: encDP,
      pvencstr: epvencstr,
      uid: walletData.uid,
      wid: ewid,
      sid: walletData.sid,
      hash: ethers.hashMessage(transactionData.message || ""),
    };

    const data = qs.stringify(inputData);

    const response = await axios.post(`${BASE_URL}/wapi/v2/sign/hash`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Secure-Channel": secureChannel.ChannelID,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(`Message signing failed: ${error}`);
  }
};

service.sendTransaction = async (signedSerializeTx) => {
  try {
    const receipt = await web3.eth.sendSignedTransaction(signedSerializeTx);
    return receipt.transactionHash;
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

service.getTransactionReceipt = async (transactionHash) => {
  try {
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);
    if (receipt) {
      return receipt;
    } else {
      throw new Error("Transaction not found");
    }
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

module.exports = service;
