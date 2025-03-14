const DEVICE_PASSWORD = process.env.DEVICE_PASSWORD;

const router = require("express").Router();
const logger = require("../services/logger.js");
const auth = require("../middleware/auth.js");
const walletService = require("../services/wallet.js");
const authService = require("../services/auth.js");
const service = require("../services/blockchain.js");
const Listing = require('../models/listing');
const Web3 = require("web3");
const web3 = new Web3();

// /**
//  * @swagger
//  * /blockchain/sign:
//  *   post:
//  *     summary: Sign Transaction
//  *     description: Signs a transaction using the provided details and returns a serialized signed transaction.
//  *     tags:
//  *       - blockchain
//  *     security:
//  *       - BearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               to:
//  *                 type: string
//  *                 description: The recipient address (Externally Owned Account or Smart Contract Account)
//  *                 example: "0x1234567890abcdef1234567890abcdef12345678"
//  *               value:
//  *                 type: string
//  *                 description: The amount of wei (smallest Ether unit) to send, in hexadecimal format.
//  *                 example: "0x38d7ea4c68000" # 0.01 ETH in wei
//  *                 default: "0x0"
//  *               data:
//  *                 type: string
//  *                 description: Encoded function call data or transaction payload.
//  *                 example: "0x"
//  *     responses:
//  *       200:
//  *         description: Successfully signed the transaction.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 data:
//  *                   type: string
//  *                   description: The serialized signed transaction ready for broadcasting.
//  *       404:
//  *         description: Internal server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: failed
//  *
//  *
//  */
// router.post("/sign", auth, async (req, res) => {
//   try {
//     let to = req.body.to || "";
//     let value = req.body.value || "0x0";
//     let data = req.body.data || "";
//     let accessToken = req.token;

//     let secureChannelRes = await authService.createSecureChannel();
//     const encryptedDevicePassword = authService.encrypt(
//       secureChannelRes,
//       DEVICE_PASSWORD
//     );

//     let walletData = await walletService.getWallet(accessToken);
//     let email = walletData.email;

//     walletData = await walletService.createWallet(
//       email,
//       encryptedDevicePassword,
//       secureChannelRes.ChannelID,
//       accessToken
//     );

//     let transactionData = {
//       network: process.env.NETWORK_NAME,
//       type: "LEGACY",
//       data,
//       to,
//       value
//     };

//     let signedTx = await service.signTransaction(
//       secureChannelRes,
//       walletData,
//       transactionData,
//       accessToken
//     );
//     return res.status(200).json({ status: "success", data: signedTx });
//   } catch (err) {
//     logger.error(err.message);
//     return res.status(404).json({ status: "failed" });
//   }
// });

/**
 * @swagger
 * /blockchain/sign/transaction:
 *   post:
 *     summary: Sign Transaction
 *     description: Signs a transaction using the provided details and returns a serialized signed transaction.
 *     tags:
 *       - blockchain
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 description: The recipient address (Externally Owned Account or Smart Contract Account)
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *               value:
 *                 type: string
 *                 description: The amount of ETH to send.
 *                 example: "'1' # 1 ETH"
 *                 default: "0"
 *               data:
 *                 type: string
 *                 description: Encoded function call data or transaction payload.
 *                 example: "0x"
 *     responses:
 *       200:
 *         description: Successfully signed the transaction.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: string
 *                   description: The serialized signed transaction ready for broadcasting.
 *       404:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *
 *
 */
router.post("/sign/transaction", auth, async (req, res) => {
  try {
    let to = req.body.to || "";
    let value = req.body.value || "0";
    let data = req.body.data || "";
    let accessToken = req.token;

    let secureChannelRes = await authService.createSecureChannel();
    const encryptedDevicePassword = authService.encrypt(
      secureChannelRes,
      DEVICE_PASSWORD
    );

    let walletData = await walletService.getWallet(accessToken);
    let email = walletData.email;

    walletData = await walletService.createWallet(
      email,
      encryptedDevicePassword,
      secureChannelRes.ChannelID,
      accessToken
    );

    let transactionData = {
      data,
      to,
      value
    };

    console.log(transactionData)

    let signedTx = await service.signTransaction(
      secureChannelRes,
      walletData,
      transactionData,
      accessToken
    );
    return res.status(200).json({ status: "success", data: signedTx });
  } catch (err) {
    logger.error(err.message);
    return res.status(404).json({ status: "failed" });
  }
});

/**
 * @swagger
 * /blockchain/sign/message:
 *   post:
 *     summary: Sign Message
 *     description: Allows users to sign a plain message using their authentication credentials. The signed message can be used for verification purposes.
 *     tags:
 *       - blockchain
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The plain text message that needs to be signed.
 *     responses:
 *       200:
 *         description: The message has been successfully signed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   description: Contains the signed message and additional information.
 *                   properties:
 *                     signstr:
 *                       type: string
 *                       description: The signed message string.
 *                     iserr:
 *                       type: boolean
 *                       description: Indicates if there is an error (true/false)
 *                     errmsg:
 *                       type: string
 *                       description: Error message, if any
 *       404:
 *         description: An internal server error occurred while signing the message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 */
router.post("/sign/message", auth, async (req, res) => {
  try {
    let message = req.body.message || "";
    let accessToken = req.token;

    let secureChannelRes = await authService.createSecureChannel();
    const encryptedDevicePassword = authService.encrypt(
      secureChannelRes,
      DEVICE_PASSWORD
    );

    let walletData = await walletService.getWallet(accessToken);
    let email = walletData.email;

    walletData = await walletService.createWallet(
      email,
      encryptedDevicePassword,
      secureChannelRes.ChannelID,
      accessToken
    );

    let transactionData = {
      message
    };

    let signedTx = await service.signMessage(
      secureChannelRes,
      walletData,
      transactionData,
      accessToken
    );
    return res.status(200).json({ status: "success", data: signedTx });
  } catch (err) {
    logger.error(err.message);
    return res.status(404).json({ status: "failed" });
  }
});

/**
 * @swagger
 * /blockchain/raw-tx/send:
 *   post:
 *     summary: Send a Raw Transaction
 *     description: Broadcasts a signed and serialized transaction to the blockchain network.
 *     tags:
 *       - blockchain
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               signedSerializeTx:
 *                 type: string
 *                 description: A fully signed and serialized transaction ready for submission to the blockchain.
 *                 example: "0xf86c808504a817c80082520894..."
 *     responses:
 *       200:
 *         description: Transaction sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: string
 *                   description: The transaction hash confirming the broadcast.
 *                   example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *       404:
 *         description: Invalid request, possibly due to a malformed transaction.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: "Problem while sending transaction"
 *
 *
 */
router.post("/raw-tx/send", async (req, res) => {
  try {
    let signedSerializeTx = req.body.signedSerializeTx;

    let txnRes = await service.sendTransaction(signedSerializeTx);
    return res
      .status(200)
      .json({ status: "success", data: txnRes, message: "Transaction sent successfully" });
  } catch (err) {
    logger.error(err.message);
    return res
      .status(404)
      .json({ status: "failed", message: "Problem while sending Transaction" });
  }
});

/**
 * @swagger
 * /blockchain/receipt:
 *   post:
 *     summary: Retrieve Transaction Receipt
 *     description: Fetches the transaction receipt to check the status and details of a submitted transaction
 *     tags:
 *       - blockchain
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionHash:
 *                 type: string
 *                 description: The hash of the transaction whose receipt is being queried.
 *                 example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *     responses:
 *       200:
 *         description: Successfully retrieved the transaction receipt.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   description: Transaction receipt details.
 *                   properties:
 *                     transactionHash:
 *                       type: string
 *                       description: The transaction hash.
 *                       example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *                     blockHash:
 *                       type: string
 *                       description: The hash of the block containing the transaction.
 *                       example: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
 *                     blockNumber:
 *                       type: integer
 *                       description: The block number in which the transaction was included.
 *                       example: 1234567
 *                     from:
 *                       type: string
 *                       description: The sender's Ethereum address.
 *                       example: "0xabcdef1234567890abcdef1234567890abcdef12"
 *                     to:
 *                       type: string
 *                       description: The recipient's Ethereum address (or `null` if contract creation).
 *                       example: "0x1234567890abcdef1234567890abcdef12345678"
 *                     contractAddress:
 *                       type: string
 *                       description: The contract address created (if applicable), otherwise `null`.
 *                       example: null
 *                     gasUsed:
 *                       type: string
 *                       description: The amount of gas used by this transaction.
 *                       example: "21000"
 *                     logs:
 *                       type: array
 *                       description: Array of log objects generated by this transaction.
 *                       items:
 *                         type: object
 *                     status:
 *                       type: boolean
 *                       description: true if the transaction was successful, false otherwise.
 *                       example: true
 *       404:
 *         description: Transaction receipt not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: "Problem while getting transaction status"
 *
 *
 */
router.post("/receipt", async (req, res) => {
  try {
    let transactionHash = req.body.transactionHash;

    let receipt = await service.getTransactionReceipt(transactionHash);
    return res.status(200).json({ status: "success", data: receipt });
  } catch (err) {
    logger.error(err.message);
    return res
      .status(404)
      .json({
        status: "failed",
        message: "Problem while sending Transaction status",
      });
  }
});

/**
 * @swagger
 * /blockchain/marketplace/mint:
 *   post:
 *     summary: Mint an NFT for given collection
 *     description: Mint an NFT for given collection
 *     tags:
 *       - blockchain
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenAddress:
 *                 type: string
 *                 description: NFT contract address
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *               tokenUri:
 *                 type: string
 *                 description: IPFS Metadata Url
 *     responses:
 *       200:
 *         description: Successfully minted NFT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   description: Transaction receipt details.
 *                   properties:
 *                     transactionHash:
 *                       type: string
 *                       description: The transaction hash.
 *                       example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *       404:
 *         description: Mint Transaction failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: "Problem while initiating Minting NFT"
 *
 *
 */
router.post("/marketplace/mint", auth, async (req, res) => {
  try {
    let accessToken = req.token;

    let tokenAddress = req.body.tokenAddress;

    let paytokenAddress = process.env.WFTM_ADDRESS;

    let tokenUri = req.body.tokenUri;

    let secureChannelRes = await authService.createSecureChannel();
    const encryptedDevicePassword = authService.encrypt(
      secureChannelRes,
      DEVICE_PASSWORD
    );

    let walletData = await walletService.getWallet(accessToken);
    let email = walletData.email;
    let owner = walletData.address;

    walletData = await walletService.createWallet(
      email,
      encryptedDevicePassword,
      secureChannelRes.ChannelID,
      accessToken
    );

    // Check balance
    let balance = await service.getTokenBalance(owner, paytokenAddress);
    let platformFee = await service.getPlatformFee(tokenAddress);
    balance = web3.utils.fromWei(balance, "ether")
    platformFee = web3.utils.fromWei(platformFee, "ether")
    console.log(balance, platformFee);
    if(parseFloat(balance) < parseFloat(platformFee)) {
      return res.status(404).json({ status: "failed", message: "Insufficient DT balance for Platform Fee. Required "+platformFee+" DT Tokens" });
    }

    let isApproved = await service.isERC20Approved(owner, tokenAddress, paytokenAddress);
    console.log(isApproved);
    if(!isApproved) {
      let approved = await service.approveERC20(tokenAddress, paytokenAddress, accessToken, secureChannelRes, walletData);
      if(!approved) {
        return res.status(404).json({ status: "failed", message: "Problem while approving ERC20" });
      }
    }

    let receipt = await service.mintNFT(paytokenAddress, tokenAddress, tokenUri, accessToken, secureChannelRes, walletData);

    return res.status(200).json({ status: "success", data: { transactionHash: receipt.transactionHash } });
  } catch (err) {
    logger.error(err.message);
    return res
      .status(404)
      .json({
        status: "failed",
        message: "Problem while sending Transaction status for mint NFT",
      });
  }
});

/**
 * @swagger
 * /blockchain/marketplace/sell:
 *   post:
 *     summary: Approve NFT and List NFT for Sale
 *     description: Approve NFT and List NFT for Sale
 *     tags:
 *       - blockchain
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenAddress:
 *                 type: string
 *                 description: NFT contract address
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *               tokenId:
 *                 type: number
 *                 description: NFT token ID
 *                 example: 1
 *               price:
 *                 type: number
 *                 description: Price of NFT in DT tokens
 *                 example: 1
 *     responses:
 *       200:
 *         description: Successfully initiated Sell Transaction.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   description: Transaction receipt details.
 *                   properties:
 *                     transactionHash:
 *                       type: string
 *                       description: The transaction hash.
 *                       example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *       404:
 *         description: Sell Transaction failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: "Problem while initiating Sell Transaction"
 *
 *
 */
router.post("/marketplace/sell", auth, async (req, res) => {
  try {

    let accessToken = req.token;

    let tokenAddress = req.body.tokenAddress;
    let tokenId = req.body.tokenId;
    let price = isNaN(req.body.price) ? "0": req.body.price.toString();

    if(price == "0") {
      return res.status(429).json({ status: "failed", message: "Invalid price" });
    }

    let paytokenAddress = process.env.WFTM_ADDRESS;

    let operator = process.env.MARKETPLACE_ADDRESS;

    let secureChannelRes = await authService.createSecureChannel();
    const encryptedDevicePassword = authService.encrypt(
      secureChannelRes,
      DEVICE_PASSWORD
    );

    let walletData = await walletService.getWallet(accessToken);
    let email = walletData.email;
    let owner = walletData.address;

    walletData = await walletService.createWallet(
      email,
      encryptedDevicePassword,
      secureChannelRes.ChannelID,
      accessToken
    );

    let isApproved = await service.isNFTApproved(tokenId, operator, tokenAddress);
    if(!isApproved) {
      let approved = await service.approveNFT(tokenId, operator, tokenAddress, owner, accessToken, secureChannelRes, walletData);
      if(!approved) {
        return res.status(429).json({ status: "failed", message: "Problem while approving NFT" });
      }
    }

    let receipt = await service.sellNFT(tokenId, price, paytokenAddress, tokenAddress, owner, accessToken, secureChannelRes, walletData);

    return res.status(200).json({ status: "success", data: { transactionHash: receipt.transactionHash } });
  } catch (err) {
    logger.error(err.message);
    return res
      .status(404)
      .json({
        status: "failed",
        message: "Problem while selling NFT",
      });
  }
});

/**
 * @swagger
 * /blockchain/marketplace/buy:
 *   post:
 *     summary: Approve Pay tokens and Buy NFT
 *     description: Approve Pay tokens and Buy NFT
 *     tags:
 *       - blockchain
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenAddress:
 *                 type: string
 *                 description: NFT contract address
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *               tokenId:
 *                 type: number
 *                 description: NFT token ID
 *                 example: 1
 *     responses:
 *       200:
 *         description: Successfully initiated Sell Transaction.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   description: Transaction receipt details.
 *                   properties:
 *                     transactionHash:
 *                       type: string
 *                       description: The transaction hash.
 *                       example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *       404:
 *         description: Sell Transaction failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: "Problem while initiating Sell Transaction"
 *
 *
 */
router.post("/marketplace/buy", auth, async (req, res) => {
  try {
    let accessToken = req.token;

    let tokenAddress = req.body.tokenAddress;
    let tokenId = req.body.tokenId;

    let paytokenAddress = process.env.WFTM_ADDRESS;

    let operator = process.env.MARKETPLACE_ADDRESS;

    let secureChannelRes = await authService.createSecureChannel();
    const encryptedDevicePassword = authService.encrypt(
      secureChannelRes,
      DEVICE_PASSWORD
    );

    let walletData = await walletService.getWallet(accessToken);
    let email = walletData.email;
    let owner = walletData.address;

    walletData = await walletService.createWallet(
      email,
      encryptedDevicePassword,
      secureChannelRes.ChannelID,
      accessToken
    );

    let listings = await Listing.find({
      minter: tokenAddress,
      tokenID: parseInt(tokenId)
    });
    if(listings.length == 0) {
      return res.status(404).json({ status: "failed", message: "Listing not found" });
    }
    let price = listings[0].price;

    // Check balance
    let balance = await service.getTokenBalance(owner, paytokenAddress);
    console.log(balance);
    balance = web3.utils.fromWei(balance, "ether")
    if(parseFloat(balance) < parseFloat(price)) {
      return res.status(404).json({ status: "failed", message: "Insufficient balance" });
    }

    let isApproved = await service.isERC20Approved(owner, operator, paytokenAddress);
    console.log(isApproved);
    if(!isApproved) {
      let approved = await service.approveERC20(operator, paytokenAddress, accessToken, secureChannelRes, walletData);
      if(!approved) {
        return res.status(404).json({ status: "failed", message: "Problem while approving ERC20" });
      }
    }

    let receipt = await service.buyNFT(tokenId, paytokenAddress, tokenAddress, accessToken, secureChannelRes, walletData);

    return res.status(200).json({ status: "success", data: { transactionHash: receipt.transactionHash } });
  } catch (err) {
    logger.error(err.message);
    return res
      .status(404)
      .json({
        status: "failed",
        message: "Problem while sending Transaction status",
      });
  }
});

/**
 * @swagger
 * /blockchain/ft/balance/dt:
 *   get:
 *     summary: Get DT Token Balance
 *     description: Get DT Token Balance
 *     tags:
 *       - blockchain
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully initiated Sell Transaction.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   description: Transaction receipt details.
 *                   properties:
 *                     balance:
 *                       type: string
 *                       description: Balance in wei.
 *                     units:
 *                       type: string
 *                       description: Units of balance.
 *                       example: wei
 *       404:
 *         description: Problem while fetching balance.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: "Problem while fetching balance"
 *
 *
 */
router.get("/ft/balance/dt", auth, async (req, res) => {
  try {
    let accessToken = req.token;
    let walletData = await walletService.getWallet(accessToken);
    let address = walletData.address;
    let tokenAddress = process.env.WFTM_ADDRESS;

    let balance = await service.getTokenBalance(address, tokenAddress);
    return res.status(200).json({ status: "success", data: { balance, units: 'wei' } });
  } catch (err) {
    logger.error(err.message);
    return res.status(404).json({ status: "failed" });
  }
});

/**
 * @swagger
 * /blockchain/nft/{tokenAddress}/platformfee:
 *   get:
 *     summary: Get NFT Platform fee
 *     description: Get NFT Platform fee
 *     tags:
 *       - blockchain
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: The NFT tokenAddress address.
 *     responses:
 *       200:
 *         description: Successfully fetched Platform fee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   description: Platform fee details.
 *                   properties:
 *                     platformfee:
 *                       type: string
 *                       description: Platform fee in wei.
 *                     units:
 *                       type: string
 *                       description: Units of balance.
 *                       example: wei
 *       404:
 *         description: Problem while fetching balance.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: "Problem while fetching balance"
 *
 *
 */
router.get("/nft/:tokenAddress/platformfee", auth, async (req, res) => {
  try {
    let tokenAddress = req.params.tokenAddress;

    let platformFee = await service.getPlatformFee(tokenAddress);
    return res.status(200).json({ status: "success", data: { platformFee, units: 'wei' } });
  } catch (err) {
    logger.error(err.message);
    return res.status(404).json({ status: "failed" });
  }
});

/**
 * @swagger
 * /blockchain/marketplace/platformfee:
 *   get:
 *     summary: Get Marketplace Platform fee
 *     description: Get Marketplace Platform fee
 *     tags:
 *       - blockchain
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched Platform fee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   description: Platform fee details.
 *                   properties:
 *                     platformfee:
 *                       type: string
 *                       description: Platform fee in wei.
 *                     units:
 *                       type: string
 *                       description: Units of balance.
 *                       example: wei
 *       404:
 *         description: Problem while fetching platform fee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *                 message:
 *                   type: string
 *                   example: "Problem while fetching platform fee"
 *
 *
 */
router.get("/marketplace/platformfee", auth, async (req, res) => {
  try {
    let marketplaceAddress = process.env.MARKETPLACE_ADDRESS;

    let platformFee = await service.getMarketplacePlatformFee(marketplaceAddress);
    return res.status(200).json({ status: "success", data: { platformFee, units: 'wei' } });
  } catch (err) {
    logger.error(err.message);
    return res.status(404).json({ status: "failed" });
  }
});

module.exports = router;
