const jwt = require("jsonwebtoken");
const Logger = require("../services/logger");
const BASE_URL = process.env.BASEURL;
const axios = require("axios");
// const jwt_secret = process.env.JWT_SECRET;

// Praveen RESET (used for artion client)
// const auth = (req, res, next) => {
//   try {
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];

//     if (token == null)
//       return res.status(401).json({
//         status: "failed",
//         data: "auth token not provided",
//       });
//       console.log(token);
//       console.log(jwt_secret);
//     jwt.verify(token, jwt_secret, (err) => {
//       if (err)
//         return res.status(400).json({
//           status: "failed",
//           data: "auth token expired",
//         });
//       next();
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({
//       status: "failed",
//       data: "auth token expired",
//     });
//   }
// };

// Below is for ABCWAAS
const auth = async (req, res, next) => {
  Logger.info(req.headers);
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "failed", message: "Unauthorized: No token provided" });
  }
  const token = authHeader.split(" ")[1];
  
  // validate Token
  try {
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken) {
      throw new Error('Failed to parse token');
    }

    const claims = decodedToken.payload;
    const iss = claims.iss;
    const parsedURL = new URL(iss);
    const userPoolID = parsedURL.pathname.substring(1);

    const response = await axios.get(
      `${BASE_URL}/jwk/key-service/${userPoolID}/.well-known/jwks.json`,
    );
    if (response.status !== 200) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    const result = response.data;

    const jwtHeader = decodedToken.header;
    const kid = jwtHeader.kid;
    if (!kid) {
      throw new Error('Failed to get kid from token header');
    }

    const foundKey = result.keys.find((key) => key.kid === kid);

    if(foundKey !== undefined) {
      req.token = token;
      next();
    } else {
      throw new Error('Failed to find key');
    }
  } catch (error) {
    Logger.error(error);
    return res.status(404).json({ status: "failed", message: "Not Authorized" });
  }


};

module.exports = auth;
