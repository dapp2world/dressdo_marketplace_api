var service = require("../services/auth.js");
var walletService = require("../services/wallet.js");
const DEVICE_PASSWORD = process.env.DEVICE_PASSWORD;

// const jwt = require("jsonwebtoken");
// const jwt_secret = process.env.JWT_SECRET || "";
const router = require("express").Router();
const { ethers } = require("ethers");
const Account = require("../models/account");
const NotificationSetting = require("../models/notificationsetting");
const toLowerCase = require("../utils/utils");
const logger = require('../services/logger');
const ADMINADDRESS = process.env.ADMINADDRESS;

/**
 * @swagger
 * /auth/{email}/verify-email:
 *   get:
 *     summary: Verify User availability by email
 *     description: Check if a user exists in the system by providing an email address
 *     tags:
 *       - auth
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email address of the user whose availability needs to be checked.
 *     responses:
 *       200:
 *         description: The email is associated with an existing user account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "User exists"
 *       404:
 *         description: No user account is associated with the given email address.
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
 *                   example: "User doesn't exist"
 *
 *
 */
router.get("/:email/verify-email", async (req, res) => {
  try {
    let email = req.params.email || "";

    let isUserExists = await service.isUserExists(email);
    if (isUserExists) {
      return res.status(200).json({ status: "success", message: "User exists" });
    } else {
      return res
        .status(404)
        .json({ status: "failed", message: "User doesn't exist" });
    }
  } catch (err) {
    logger.error(err.message);
    return res.status(404).json({ status: "failed", message: err.message });
  }
});

/**
 * @swagger
 * /auth/{email}/send-code:
 *   get:
 *     summary: Send verification code
 *     description: Sends a verification code to the specified email address..
 *     tags:
 *       - auth
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           description: The email address to which the verification code will be sent
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: ["en", "ko", "ja"]
 *           default: "en"
 *         example: "en"
 *         description: The language in which the verification email should be sent. Defaults to English.
 *       - in: query
 *         name: template
 *         schema:
 *           type: string
 *           enum: ["verify", "initpassword"]
 *         example: "verify"
 *         description: Specifies the type of email template to be used. 
 *                      "verify" for authentication verification, "initpassword" for password reset
 *     responses:
 *       200:
 *         description: The verification code was sent successfully to the provided email address
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Code sent successfully"
 *       404:
 *         description: An issue occurred while attempting to send the verification code.
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
 *                   example: "Problem while sending code"
 *
 *
 */
router.get("/:email/send-code", async (req, res) => {
  try {
    let email = req.params.email;
    let lang = req.query.lang;
    let template = req.query.template;

    await service.sendCode(email, lang, template);
    return res
      .status(200)
      .json({status: "success", message: "Code sent successfully" });
  } catch (err) {
    logger.error(err.message);
    return res
      .status(404)
      .json({ status: "failed", message: "Problem while sending code" });
  }
});

/**
 * @swagger
 * /auth/{email}/verify-code:
 *   post:
 *     summary: Verify user verification code
 *     description: Verifies the authentication code sent to the user's email
 *     tags:
 *       - auth
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           description: The email address of the user attempting to verify their code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: The verification code received by the user via email.
 *     responses:
 *       200:
 *         description: The verification code was successfully validated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Code verified successful"
 *       404:
 *         description: The provided verification code is invalid or expired.
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
 *                   example: "Code verification failed"
 *
 *
 */
router.post("/:email/verify-code", async (req, res) => {
  try {
    let email = req.params.email || "";
    let code = req.body.code || "";

    await service.verifyCode(email, code);
    return res
      .status(200)
      .json({ status: "success", message: "Code verification successful" });
  } catch (err) {
    logger.error(err.message);
    return res
      .status(404)
      .json({ status: "failed", message: "Code verification failed" });
  }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User Registration
 *     description: Registers a new user by collecting their email, password, and additional consent options. A verification code is required to complete the registration process
 *     tags:
 *       - auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user.
 *               password:
 *                 type: string
 *                 description: The password chosen by the user.
 *               code:
 *                 type: string
 *                 description: The verification code sent to the user's email.
 *               overage:
 *                 type: boolean
 *                 default: false
 *                 description: Indicates if the user is over the required age limit.
 *               agree:
 *                 type: boolean
 *                 default: false
 *                 description: Confirms the user has agreed to the terms and conditions.
 *               collect:
 *                 type: boolean
 *                 default: false
 *                 description: Consent for data collection.
 *               thirdParty:
 *                 type: boolean
 *                 default: false
 *                 description: Consent for sharing data with third parties.
 *               advertise:
 *                 type: boolean
 *                 default: false
 *                 description: Consent for receiving promotional content.
 *     responses:
 *       200:
 *         description: The user was successfully registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *       428:
 *         description: The authentication code provided does not match. 
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
 *                   example: "Authentication code does not match"
 *       404:
 *         description: An error occurred while attempting to register the user.
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
 *                   example: "Problem while registering user"
 */
router.post("/register", async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    let code = req.body.code;
    let overage = req.body.overage ? 1 : 0;
    let agree = req.body.agree ? 1 : 0;
    let collect = req.body.collect ? 1 : 0;
    let thirdParty = req.body.thirdParty ? 1 : 0;
    let advertise = req.body.advertise ? 1 : 0;

    try {
      await service.verifyCode(email, code);
    } catch(_) {
      return res.status(428).json({ status: "failed", message: "Authentication code does not match" });
    }
    
    const secureChannelRes = await service.createSecureChannel();
    const encryptedPassword = service.encrypt(secureChannelRes, password);

    await service.registerUser({
      email,
      encryptedPassword,
      code,
      overage,
      agree,
      collect,
      thirdParty,
      advertise,
      channelId: secureChannelRes.ChannelID,
    });
    return res
      .status(200)
      .json({ status: "success", message: "User registered successfully" });
  } catch (err) {
    logger.error(err.message);
    return res.status(404).json({ status: "failed", message: "Problem while registering user" });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User Login
 *     description: Authenticates a user by verifying their email and password. Upon successful authentication, an access token and refresh token are returned.
 *     tags:
 *       - auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The registered email address of the user.
 *               password:
 *                 type: string
 *                 description: The user's password for authentication.
 *     responses:
 *       200:
 *         description: The user has been successfully authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: "Access token valid for 10 minutes."
 *                     refreshToken:
 *                       type: string
 *                       description: "Refresh token valid for 60 minutes."
 *                     expireIn:
 *                       type: number
 *                       description: "Token expiry time in seconds."
 *                       example: 600
 *                     address:
 *                       type: string
 *                       description: "User's wallet address."
 *                     isAdmin:
 *                       type: boolean
 *                       description: "Indicates if the user has admin privileges."
 *       404:
 *         description: Authentication failed due to incorrect credentials or non-existent user.
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
 *                   example: "Login failed"
 */
router.post("/login", async (req, res) => {
  try {
    let email = req.body.email || "";
    let password = req.body.password || "";

    let secureChannelRes = await service.createSecureChannel();
    const encryptedPassword = service.encrypt(secureChannelRes, password);

    const loginRes = await service.loginUser(
      email,
      encryptedPassword,
      secureChannelRes.ChannelID
    );

    let walletInfo;
    try {
      walletInfo = (await walletService.getWallet(loginRes.accessToken)).address;
    } catch (_) {}

    if (!walletInfo) {
      const encryptedDevicePassword = service.encrypt(
        secureChannelRes,
        DEVICE_PASSWORD
      );
      try {
        walletInfo = (await walletService.createWallet(
          email,
          encryptedDevicePassword,
          secureChannelRes.ChannelID,
          loginRes.accessToken
        )).sid;
      } catch (_) {}
    }

    let _address = toLowerCase(walletInfo);

    // save a new account if not registered
    let account = await Account.findOne({ address: _address });
    if (!account) {
      try {
        let newAccount = new Account();
        newAccount.address = _address;
        newAccount.email = email;
        await newAccount.save();
      } catch (error) {}
    }
  
    let notificationSettings = await NotificationSetting.findOne({
      address: _address,
    });
    if (!notificationSettings)
      try {
        let ns = new NotificationSetting();
        ns.address = _address;
        await ns.save();
      } catch (error) {
        logger.error(error);
      }

    return res.status(200).json({
      status: "success",
      data: {
        accessToken: loginRes.accessToken,
        refreshToken: loginRes.refreshToken,
        expireIn: loginRes.expireIn,
        address: walletInfo,
        isAdmin: toLowerCase(walletInfo) === toLowerCase(ADMINADDRESS)
      },
      message: "Login successful",
    });
  } catch (err) {
    logger.error(err);
    return res.status(404).json({ status: "failed", message: err.message });
  }
});

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Reissue Access and Refresh Tokens
 *     description: Allows users to obtain a new access token and refresh token using an existing refresh token. It helps maintain user authentication without requiring a full login
 *     tags:
 *       - auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token used to generate new authentication tokens.
 *     responses:
 *       200:
 *         description: The access token has been successfully reissued.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Reissue access token successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: "New access token valid for 10 minutes."
 *                     refreshToken:
 *                       type: string
 *                       description: "New refresh token valid for 60 minutes."
 *                     expireIn:
 *                       type: number
 *                       description: "Token expiry time in seconds."
 *                       example: 600
 *       404:
 *         description: The token reissue process failed due to an invalid or expired refresh token.
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
 *                   example: "Reissue Accesstoken failed"
 */
router.post("/refresh-token", async (req, res) => {
  try {
    let refreshToken = req.body.refreshToken || "";

    const refreshTokenRes = await service.refreshToken(refreshToken);

    return res.status(200).json({
      status: "success",
      data: {
        accessToken: refreshTokenRes.accessToken,
        refreshToken: refreshTokenRes.refreshToken,
        expireIn: refreshTokenRes.expireIn,
      },
      message: "Reissue Accesstoken successful",
    });
  } catch (err) {
    logger.error(err);
    return res.status(404).json({ status: "failed", message: err.message });
  }
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset Password
 *     description: Allows users to reset their password by providing their registered email, a new password, and a valid initpassword code received via email.
 *     tags:
 *       - auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The registered email address of the user.
 *               password:
 *                 type: string
 *                 description: The new password that the user wants to set.
 *               code:
 *                 type: string
 *                 description: The initpassword code received via email for reset verification.
 *     responses:
 *       200:
 *         description: The password has been successfully reset.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Password reset successful"
 *       404:
 *         description: The password reset process failed due to an invalid email, incorrect authentication code, or other errors.
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
 *                   example: "Password Reset failed"
 */
router.post("/reset-password", async (req, res) => {
  try {
    let email = req.body.email || "";
    let password = req.body.password || "";
    let code = req.body.code || "";

    const secureChannelRes = await service.createSecureChannel();
    const encryptedPassword = service.encrypt(secureChannelRes, password);

    await service.resetPassword(
      email,
      encryptedPassword,
      code,
      secureChannelRes.ChannelID
    );

    return res.status(200).json({
      status: "success",
      message: "Password Reset successful",
    });
  } catch (err) {
    logger.error(err);
    return res.status(404).json({ status: "failed", message: err.message });
  }
});

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change Password
 *     description: Allows users to change their password by providing their registered email, the old password, and a new password.
 *     tags:
 *       - auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The registered email address of the user.
 *               oldpassword:
 *                 type: string
 *                 description: The current password of the user.
 *               newpassword:
 *                 type: string
 *                 description: The new password that the user wants to set.
 *     responses:
 *       200:
 *         description: The password has been successfully changed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Change Password successful"
 *       404:
 *         description: The password change process failed due to incorrect old password, invalid email, or other errors.
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
 *                   example: "Change Password failed"
 */
router.post("/change-password", async (req, res) => {
  try {
    let email = req.body.email || "";
    let oldpassword = req.body.oldpassword || "";
    let newpassword = req.body.newpassword || "";

    const secureChannelRes = await service.createSecureChannel();
    const oldEncryptedPassword = service.encrypt(secureChannelRes, oldpassword);
    const newEncryptedPassword = service.encrypt(secureChannelRes, newpassword);

    await service.changePassword(
      email,
      oldEncryptedPassword,
      newEncryptedPassword,
      secureChannelRes.ChannelID
    );

    return res.status(200).json({
      status: "success",
      message: "Change Password successful",
    });
  } catch (err) {
    logger.error(err);
    return res.status(404).json({ status: "failed", message: err.message });
  }
});

// router.post("/getToken", async (req, res) => {
//   let address = req.body.address;
//   let isAddress = ethers.isAddress(address);
//   if (!isAddress)
//     return res.json({
//       status: "failed",
//       token: "",
//     });
//   address = toLowerCase(address);
//   // save a new account if not registered
//   let account = await Account.findOne({ address: address });
//   if (!account) {
//     try {
//       let newAccount = new Account();
//       newAccount.address = address;
//       await newAccount.save();
//     } catch (error) {}
//   }

//   let notificationSettings = await NotificationSetting.findOne({
//     address: address,
//   });
//   if (!notificationSettings)
//     try {
//       let ns = new NotificationSetting();
//       ns.address = address;
//       let _ns = await ns.save();
//     } catch (error) {
//       Logger.error(error);
//     }
//   let token = jwt.sign(
//     {
//       data: address,
//     },
//     jwt_secret,
//     { expiresIn: "24h" }
//   );
//   return res.json({
//     status: "success",
//     token: token,
//   });
// });


module.exports = router;
