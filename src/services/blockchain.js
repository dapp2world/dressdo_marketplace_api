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



service.approveNFT = async (tokenId, operator, tokenAddress, owner, accessToken, secureChannel, walletData) => {
  try {
    const sellapprovalencodedData = web3.eth.abi.encodeFunctionCall(
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      [operator, true]
    );

    let approvalTransactionData = {
      from: owner,
      to: tokenAddress,
      data: sellapprovalencodedData,
      value: '0'
    };
    let approvalSignResult = await service.signTransaction(
      secureChannel, 
      walletData,
      approvalTransactionData,
      accessToken
    );
    console.log(approvalSignResult);

    let approvaltransactionHashRes = await service.sendTransaction(
      approvalSignResult
    );
    console.log(approvaltransactionHashRes);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let approvalreceipt = await service.getTransactionReceipt(
      approvaltransactionHashRes
    );
    console.log(approvalreceipt);
    
  } catch(error) {
    console.log(error);
    throw new Error(error.message);
  }
}

service.approveERC20 = async (operator, tokenAddress, accessToken, secureChannel, walletData) => {
  let approveAmount = '115792089237316195423570985008687907853269984665640564039457584007913129639935'; //(2^256 - 1 )
  try {
    const erc20ApproveEncodedData = web3.eth.abi.encodeFunctionCall(
      {
        "constant": false,
        "inputs": [
            {
              "internalType": "address",
                "name": "_spender",
                "type": "address"
            },
            {
              "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      [operator, approveAmount]
    );

    let erc20ApproveData = {
      to: tokenAddress,
      data: erc20ApproveEncodedData,
      value: '0'
    };

    console.log(erc20ApproveData);

    let erc20ApproveSignResult = await service.signTransaction(
      secureChannel, 
      walletData,
      erc20ApproveData,
      accessToken
    );
    console.log(erc20ApproveSignResult);

    let erc20ApproveHashRes = await service.sendTransaction(
      erc20ApproveSignResult
    );
    console.log(erc20ApproveHashRes);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let erc20Approvereceipt = await service.getTransactionReceipt(
      erc20ApproveHashRes
    );
    console.log(erc20Approvereceipt);
    
  } catch(error) {
    console.log(error);
    throw new Error(error.message);
  }
}

const LIST_ITEM_ABI = {
  "inputs": [
    {
      "internalType": "address",
      "name": "_nftAddress",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_tokenId",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_quantity",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "_payToken",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_pricePerItem",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_startingTime",
      "type": "uint256"
    }
  ],
  "name": "listItem",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
};

service.sellNFT = async (tokenId, price, paytokenAddress, tokenAddress, owner, accessToken, secureChannel, walletData) => {
  try {
    let listQuantity = 1; //token amount to list (needed for ERC-1155 NFTs, set as 1 for ERC-721)
    let pricePerItem = web3.utils.toWei(price, "ether");
    let startingTime = Math.floor(new Date().getTime() / 1000);

    console.log([
      tokenAddress,
      tokenId,
      listQuantity,
      paytokenAddress,
      pricePerItem,
      startingTime,
    ]);
    console.log(owner, process.env.MARKETPLACE_ADDRESS);
    const sellencodedData = web3.eth.abi.encodeFunctionCall(LIST_ITEM_ABI, [
      tokenAddress,
      tokenId,
      listQuantity,
      paytokenAddress,
      pricePerItem,
      startingTime,
    ]);

    let sellTransactionData = {
      from: owner,
      to: process.env.MARKETPLACE_ADDRESS,
      data: sellencodedData,
      value: '0'
    };

    let sellSignResult = await service.signTransaction(
      secureChannel, 
      walletData,
      sellTransactionData,
      accessToken
    );
    console.log(sellSignResult);

    let selltransactionHashRes = await service.sendTransaction(
      sellSignResult
    );
    console.log(selltransactionHashRes);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let sellreceipt = await service.getTransactionReceipt(
      selltransactionHashRes
    );
    console.log(sellreceipt);
    return sellreceipt;

  } catch(error) {
    console.log(error);
    throw new Error(error.message);
  }
}

const BUY_ITEM_ABI = {
  "inputs": [
    {
      "internalType": "address",
      "name": "_nftAddress",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_tokenId",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "_payToken",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "_owner",
      "type": "address"
    }
  ],
  "name": "buyItem",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
};

service.buyNFT = async (tokenId, paytokenAddress, tokenAddress, accessToken, secureChannel, walletData) => {
  try {

    const buyItemEncodedData = web3.eth.abi.encodeFunctionCall(BUY_ITEM_ABI, [
      tokenAddress,
      tokenId,
      paytokenAddress,
      walletData.sid
    ]);

    let buyItemData = {
      to: process.env.MARKETPLACE_ADDRESS,
      data: buyItemEncodedData,
      value: '0'
    };

    console.log(buyItemData);

    let buyItemResult = await service.signTransaction(
      secureChannel, 
      walletData,
      buyItemData,
      accessToken
    );
    console.log(buyItemResult);

    let buyItemHashRes = await service.sendTransaction(
      buyItemResult
    );
    console.log(buyItemHashRes);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let buyItemreceipt = await service.getTransactionReceipt(
      buyItemHashRes
    );
    console.log(buyItemreceipt);
    return buyItemreceipt;

  } catch(error) {
    console.log(error);
    throw new Error(error.message);
  }
}

const MINT_ABI = {
  "inputs": [
    {
      "internalType": "address",
      "name": "_payToken",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "_beneficiary",
      "type": "address"
    },
    {
      "internalType": "string",
      "name": "_tokenUri",
      "type": "string"
    }
  ],
  "name": "mint",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "nonpayable",
  "type": "function"
};

service.mintNFT = async (paytokenAddress, tokenAddress, tokenUri, accessToken, secureChannel, walletData) => {
  try {

    const mintEncodedData = web3.eth.abi.encodeFunctionCall(MINT_ABI, [
      paytokenAddress,
      walletData.sid,
      tokenUri
    ]);

    let mintData = {
      to: tokenAddress,
      data: mintEncodedData,
      value: '0'
    };

    console.log(mintData);

    let mintResult = await service.signTransaction(
      secureChannel, 
      walletData,
      mintData,
      accessToken
    );
    console.log(mintResult);

    let mintHashRes = await service.sendTransaction(
      mintResult
    );
    console.log(mintHashRes);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let mintreceipt = await service.getTransactionReceipt(
      mintHashRes
    );
    console.log(mintreceipt);
    return mintreceipt;

  } catch(error) {
    console.log(error);
    throw new Error(error.message);
  }
}

service.getTokenBalance = async (address, tokenAddress) => {
  try {
    const contract = new web3.eth.Contract(
      [
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
      ],
      tokenAddress
    );

    const balance = await contract.methods.balanceOf(address).call();
    return balance;
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

service.getPlatformFee = async (tokenAddress) => {
  try {
    const contract = new web3.eth.Contract(
      [
      {
        "inputs": [],
        "name": "platformFee",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
      ],
      tokenAddress
    );

    const platformFee = await contract.methods.platformFee().call();
    return platformFee;
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

service.getMarketplacePlatformFee = async (tokenAddress) => {
  try {
    const contract = new web3.eth.Contract(
      [
        {
          "inputs": [],
          "name": "platformFee",
          "outputs": [
            {
              "internalType": "uint16",
              "name": "",
              "type": "uint16"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ],
      tokenAddress
    );

    const platformFee = await contract.methods.platformFee().call();
    return platformFee;
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};



service.isNFTApproved = async (tokenId, operator, contractAddress) => {
  try {
    const contract = new web3.eth.Contract(
      [
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_tokenId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "_operator",
              "type": "address"
            }
          ],
          "name": "isApproved",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ],
      contractAddress
    );

    const isApproved = await contract.methods.isApproved(tokenId, operator).call();
    return isApproved;
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

service.isERC20Approved = async (owner, operator, contractAddress) => {
  // 0x03DE6b889dC82b278E35191B2BD319FeAAe26CaF 0x34De671bd97F47c4710D92C7DFb8cc9a53CbE1cB 0x78e727c21608554e289b7a59bfe9d20368a7a70b
  try {
    const contract = new web3.eth.Contract(
      [
        {
          "constant": true,
          "inputs": [
              {
                  "name": "_owner",
                  "type": "address"
              },
              {
                  "name": "_spender",
                  "type": "address"
              }
          ],
          "name": "allowance",
          "outputs": [
              {
                  "name": "",
                  "type": "uint256"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      }
      ],
      contractAddress
    );
    console.log(owner, operator, contractAddress);
    const isApproved = await contract.methods.allowance(owner, operator).call();
    return isApproved > 0;
  } catch (error) {
    console.log("Problem in isERC20Approved");
    console.log(error);
    throw new Error(error.message);
  }
};

module.exports = service;
