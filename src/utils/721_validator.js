require("dotenv").config();
// const ethers = require("ethers");
const { ethers, JsonRpcProvider } = require('ethers')
const ERC1155InterfaceID = require("../constants/1155_interfaceID_abi");

const provider = new JsonRpcProvider(
  process.env.NETWORK_RPC,
  parseInt(process.env.NETWORK_CHAINID)
);

const INTERFACEID = "0x80ac58cd";

const isValidERC721 = async (contractAddress) => {
  try {
    let testContract = new ethers.Contract(
      contractAddress,
      ERC1155InterfaceID.ABI,
      provider
    );
    let is721 = await testContract.supportsInterface(INTERFACEID);
    return is721;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = isValidERC721;
