require("dotenv").config();
const { ethers } = require("ethers");
const jwt = require("jsonwebtoken");
// const jwt_secret = process.env.JWT_SECRET;
const toLowerCase = require("../utils/utils");
const walletService = require("../services/wallet");

// Praveen RESET with below function used for artion client
// const extractAddress = (req, res) => {
//   let authorization = req.headers.authorization.split(" ")[1],
//     decoded;
//   try {
//     decoded = jwt.verify(authorization, jwt_secret);
//   } catch (e) {
//     return res.status(401).send("unauthorized");
//   }
//   console.log(decoded)
//   let address = decoded.data;
//   address = toLowerCase(address);
//   if (!ethers.isAddress(address)) {
//     return res.json({
//       status: "failed",
//       data: "invalid frc20 address",
//     });
//   }
//   return address;
// };

// Below code is for ABCWAAS
const extractAddress = async (req, res) => {
  let authorization,
    address;
  try {
    authorization = req.headers.authorization.split(" ")[1];
    address = (await walletService.getWallet(authorization)).address;
  } catch (_) {
    return res.status(404).json({ status: "failed", message: "Not Authorized" });
  }
  return toLowerCase(address);
};

module.exports = extractAddress;
