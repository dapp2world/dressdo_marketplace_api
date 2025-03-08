require("dotenv").config();
// const ethers = require("ethers");
const { ethers, JsonRpcProvider } = require('ethers')
const PayToken = require("../models/paytoken");

// price store
const priceStore = new Map();
// decimal store
const decimalStore = new Map();
// symbol store
const symbolStore = new Map();
// name store
const nameStore = new Map();
// chainlink contracts, pre-created
const chainLinkContracts = new Map();

const toLowerCase = require("../utils/utils");
const MinimalERC20ABI = require("../constants/erc20_mini_abi");
const ChainLinkFeedABI = require("../constants/chainlink_interface_abi");
const wFTMAddress = toLowerCase(process.env.WFTM_ADDRESS);

const validatorAddress = toLowerCase(process.env.VALIDATORADDRESS);

const provider = new JsonRpcProvider(
  process.env.NETWORK_RPC,
  parseInt(process.env.NETWORK_CHAINID)
);

// a background service to get price feeds for erc20 tokens

const runPriceFeed = async () => {
  try {
    let paymentTokens = await PayToken.find({});
    paymentTokens.map(async (token) => {
      try {
        let proxy = chainLinkContracts.get(token.address);
        if (proxy) {
        } else {
          proxy = new ethers.Contract(
            token.chainlinkProxyAddress,
            ChainLinkFeedABI,
            provider
          );
          chainLinkContracts.set(token, proxy);
        }
        let priceFeed = await proxy.latestRoundData();
        priceFeed =
          ethers.formatEther(priceFeed.answer) *
          10 ** (18 - token.decimals);
        priceStore.set(token.address, priceFeed);
      } catch (error) {}
    });
  } catch (error) {}
  setTimeout(async () => {
    await runPriceFeed();
  }, 1000 * 60 * 5);
};

// a background service to get names & symbols for erc20 tokens

const getPrice = (address) => {
  address = toLowerCase(address);
  if (
    address == "dt" ||
    address == "wftm" ||
    address == "fantom" ||
    address == validatorAddress
  )
    address = wFTMAddress;
  let price = priceStore.get(address);
  if (price == null) {
    price = 0;
  }
  return price;
};

const getDecimals = async (address) => {
  address = toLowerCase(address);
  if (
    address == "dt" ||
    address == "wftm" ||
    address == "fantom" ||
    address == validatorAddress
  )
    address = toLowerCase(process.env.WFTM_ADDRESS);
  let decimal = decimalStore.get(address);
  if (decimal) return decimal;
  let tokenContract = new ethers.Contract(address, MinimalERC20ABI, provider);
  decimal = await tokenContract.decimals();
  decimal = parseInt(decimal.toString());
  decimalStore.set(address, decimal);
  return decimal;
};

const getSymbol = async (address) => {
  address = toLowerCase(address);
  if (address == "dt" || address == "fantom" || address == validatorAddress)
    return "DT";
  if (address == "wftm") address = toLowerCase(process.env.WFTM_ADDRESS);
  let symbol = symbolStore.get(address);
  if (symbol) return symbol;
  let tokenContract = new ethers.Contract(address, MinimalERC20ABI, provider);
  symbol = await tokenContract.symbol();
  symbolStore.set(address, symbol);
  return symbol;
};

const getName = async (address) => {
  address = toLowerCase(address);
  if (address == "dt" || address == "fantom" || address == validatorAddress)
    return "DressDioToken";
  if (address == "wftm") address = toLowerCase(process.env.WFTM_ADDRESS);
  let name = nameStore.get(address);
  if (name) return name;
  let tokenContract = new ethers.Contract(address, MinimalERC20ABI, provider);
  name = await tokenContract.name();
  nameStore.set(address, name);
  return name;
};

const priceFeed = {
  runPriceFeed,
  getPrice,
  getDecimals,
  getSymbol,
  getName,
};

module.exports = priceFeed;
