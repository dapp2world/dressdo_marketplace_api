const router = require("express").Router();
const { sortBy } = require("lodash");
const orderBy = require("lodash.orderby");
const ERC721CONTRACT = require("../models/erc721contract");
const ERC1155CONTRACT = require("../models/erc1155contract");
const NFTITEM = require("../models/nftitems");
const Collection = require("../models/collection");
const Account = require("../models/account");
const ERC1155HOLDING = require("../models/erc1155holding");
const Category = require("../models/category");
const Bid = require("../models/bid");
const Offer = require("../models/offer");
const TradeHistory = require("../models/tradehistory");
const Listing = require("../models/listing");
const Auction = require("../models/auction");
const Bundle = require("../models/bundle");
const Like = require("../models/like");
const BundleLike = require("../models/bundlelike");

const toLowerCase = require("../utils/utils");
const Logger = require("../services/logger");

const service_auth = require("../middleware/auth.tracker");

const { getPrice, getDecimals } = require("../services/price.feed");

// list the newly minted 10 tokens
router.get("/getNewestTokens", async (_, res) => {
  let tokens = await NFTITEM.find().sort({ createdAt: 1 }).limit(20);
  return res.json({
    status: "success",
    data: tokens,
  });
});

router.get("/getNewestAuctions", async (_, res) => {
  let auctions = await Auction.find().sort({ endTime: 1 }).limit(10);
  if (auctions)
    return res.json({
      status: "success",
      data: auctions,
    });
  else
    return res.json({
      status: "success",
      data: [],
    });
});

/**
 * @swagger
 * /collection/getCollections:
 *   get:
 *     summary: Retrieve Collections
 *     description: Retrieve Collections
 *     tags:
 *       - collection
 *     responses:
 *       200:
 *         description: Successfully retrieved user account information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CollectionContractResponse'
 *       404:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failed
 *
 */
router.get("/getCollections", async (_, res) => {
  let collections_721 = await ERC721CONTRACT.find({ isAppropriate: true });
  let collections_1155 = await ERC1155CONTRACT.find({ isAppropriate: true });

  let all = new Array();
  all.push(...collections_721);
  all.push(...collections_1155);
  all = sortBy(all, "name", "desc");
  let allCollections = await Collection.find({
    status: true,
    isAppropriate: true,
  });

  let savedAddresses = [];
  let allContracts = new Array();

  allCollections.map((collection) => {
    savedAddresses.push(collection.erc721Address);
    allContracts.push({
      address: collection.erc721Address,
      collectionName: collection.collectionName,
      description: collection.description,
      categories: collection.categories,
      logoImageHash: collection.logoImageHash,
      siteUrl: collection.siteUrl,
      discord: collection.discord,
      twitterHandle: collection.twitterHandle,
      mediumHandle: collection.mediumHandle,
      telegram: collection.telegram,
      isVerified: true,
      isVisible: true,
      isInternal: collection.isInternal,
      isOwnerble: collection.isOwnerble,
    });
  });

  all.map((contract) => {
    if (!savedAddresses.includes(contract.address)) {
      savedAddresses.push(contract.address);
      allContracts.push({
        address: contract.address,
        name: contract.name != "name" ? contract.name : "",
        symbol: contract.symbol != "symbol" ? contract.symbol : "",
        logoImageHash: contract.logoImageHash,
        isVerified: contract.isVerified,
        isVisible: contract.isVerified,
      });
    }
  });

  return res.json({
    status: "success",
    data: allContracts,
  });
});

router.post("/searchNames", async (req, res) => {
  try {
    let name = req.body.name;
    // get account
    let accounts = await Account.find({
      alias: { $regex: name, $options: "i" },
    })
      .select(["address", "imageHash", "alias"])
      .limit(3);
    let collections = await Collection.find({
      collectionName: { $regex: name, $options: "i" },
    })
      .select(["erc721Address", "collectionName", "logoImageHash"])
      .limit(3);
    let tokens = await NFTITEM.find({
      name: { $regex: name, $options: "i" },
      isAppropriate: true,
    })
      .select([
        "contractAddress",
        "tokenID",
        "tokenURI",
        "name",
        "thumbnailPath",
        "imageURL",
      ])
      .limit(10);

    let bundles = await Bundle.find({
      name: { $regex: name, $options: "i" },
    })
      .select(["name", "_id"])
      .limit(10);
    let data = { accounts, collections, tokens, bundles };
    return res.json({
      status: "success",
      data: data,
    });
  } catch (error) {
    Logger.error(error);
    return res.json([]);
  }
});

router.get("/getOwnership/:address/:tokenID", async (req, res) => {
  try {
    let collection = toLowerCase(req.params.address);
    let tokenID = parseInt(req.params.tokenID);
    let holdings = await ERC1155HOLDING.find({
      contractAddress: collection,
      tokenID: tokenID,
    }).select(["holderAddress", "supplyPerHolder"]);

    let users = [];
    let promise = holdings.map(async (hold) => {
      if (hold.supplyPerHolder > 0) {
        let account = await Account.findOne({
          address: hold.holderAddress,
        });
        if (account) {
          users.push({
            address: account.address,
            alias: account.alias,
            imageHash: account.imageHash,
            supply: hold.supplyPerHolder,
          });
        } else {
          users.push({
            address: hold.holderAddress,
            supply: hold.supplyPerHolder,
          });
        }
      }
    });
    await Promise.all(promise);

    let _users = orderBy(users, "supply", "desc");
    return res.json({
      status: "success",
      data: _users,
    });
  } catch (error) {
    Logger.error(error);
    return res.json([]);
  }
});

router.get("/get1155info/:address/:tokenID", async (req, res) => {
  try {
    let collection = toLowerCase(req.params.address);
    let tokenID = parseInt(req.params.tokenID);
    let holdings = await ERC1155HOLDING.find({
      contractAddress: collection,
      tokenID: tokenID,
      supplyPerHolder: { $gt: 0 },
    });
    let count = holdings.length;
    let token = await NFTITEM.findOne({
      contractAddress: collection,
      tokenID: tokenID,
    });
    let totalSupply = token.supply;
    return res.json({
      status: "success",
      data: {
        holders: count,
        totalSupply: totalSupply,
      },
    });
  } catch (error) {
    Logger.error(error);
    return res.json([]);
  }
});

router.get("/getAccountActivity/:address", async (req, res) => {
  let tokenTypes = await Category.find();
  tokenTypes = tokenTypes.map((tt) => [tt.minterAddress, tt.type]);

  let address = toLowerCase(req.params.address);

  let bids = [];
  let offers = [];
  let listings = [];
  let sold = [];

  let bidsFromAccount = await Bid.find({
    bidder: address,
  });
  let offersFromAccount = await Offer.find({
    creator: address,
  });
  let listsFromAccount = await Listing.find({
    owner: address,
  });
  let salesFromAccount = await TradeHistory.find({ from: address });

  if (bidsFromAccount) {
    let bidsPromise = bidsFromAccount.map(async (bfa) => {
      let token = await NFTITEM.findOne({
        contractAddress: bfa.minter,
        tokenID: bfa.tokenID,
      });
      if (token) {
        let account = await getAccountInfo(token.owner);
        bids.push({
          event: "Bid",
          contractAddress: token.contractAddress,
          tokenID: token.tokenID,
          name: token.name,
          tokenURI: token.tokenURI,
          thumbnailPath: token.thumbnailPath,
          imageURL: token.imageURL,
          to: token.owner,
          price: bfa.bid,
          paymentToken: bfa.paymentToken,
          quantity: bfa.quantity,
          createdAt: bfa._id.getTimestamp(),
          alias: account ? account[0] : null,
          image: account ? account[1] : null,
        });
      }
    });

    await Promise.all(bidsPromise);
  }
  if (offersFromAccount) {
    let offersPromise = offersFromAccount.map(async (ofa) => {
      let token = await NFTITEM.findOne({
        contractAddress: ofa.minter,
        tokenID: ofa.tokenID,
      });
      if (token) {
        let account = await getAccountInfo(token.owner);
        offers.push({
          event: "Offer",
          contractAddress: token.contractAddress,
          tokenID: token.tokenID,
          name: token.name,
          tokenURI: token.tokenURI,
          thumbnailPath: token.thumbnailPath,
          imageURL: token.imageURL,
          to: token.owner,
          quantity: ofa.quantity,
          price: ofa.pricePerItem,
          paymentToken: ofa.paymentToken,
          createdAt: ofa._id.getTimestamp(),
          alias: account ? account[0] : null,
          image: account ? account[1] : null,
        });
      }
    });
    await Promise.all(offersPromise);
  }
  if (listsFromAccount) {
    let listsPromise = listsFromAccount.map(async (lfa) => {
      let token = await NFTITEM.findOne({
        contractAddress: lfa.minter,
        tokenID: lfa.tokenID,
      });
      if (token) {
        let account = await getAccountInfo(token.owner);
        listings.push({
          event: "Listing",
          contractAddress: token.contractAddress,
          tokenID: token.tokenID,
          name: token.name,
          tokenURI: token.tokenURI,
          thumbnailPath: token.thumbnailPath,
          imageURL: token.imageURL,
          to: token.owner,
          quantity: lfa.quantity,
          price: lfa.price,
          paymentToken: lfa.paymentToken,
          createdAt: lfa._id.getTimestamp(),
          alias: account ? account[0] : null,
          image: account ? account[1] : null,
        });
      }
    });
    await Promise.all(listsPromise);
  }

  if (salesFromAccount) {
    let soldPromise = salesFromAccount.map(async (sfa) => {
      let token = await NFTITEM.findOne({
        contractAddress: sfa.collectionAddress,
        tokenID: sfa.tokenID,
      });

      if (token) {
        let account = await getAccountInfo(sfa.to);
        sold.push({
          event: "Sold",
          contractAddress: token.contractAddress,
          tokenID: token.tokenID,
          name: token.name,
          tokenURI: token.tokenURI,
          thumbnailPath: token.thumbnailPath,
          imageURL: token.imageURL,
          to: sfa.to,
          quantity: sfa.value,
          price: sfa.price,
          paymentToken: sfa.paymentToken,
          createdAt: sfa._id.getTimestamp(),
          alias: account ? account[0] : null,
          image: account ? account[1] : null,
        });
      }
    });
    await Promise.all(soldPromise);
  }

  return res.json({
    status: "success",
    data: {
      bids,
      offers,
      listings,
      sold,
    },
  });
});

router.get("/getOffersFromAccount/:address", async (req, res) => {
  try {
    let address = toLowerCase(req.params.address);
    let myOffers = await Offer.find({ creator: address });
    if (!myOffers)
      return res.json({
        status: "success",
        data: [],
      });
    let offers = [];
    let promise = myOffers.map(async (offer) => {
      let token = await NFTITEM.findOne({
        contractAddress: offer.minter,
        tokenID: offer.tokenID,
      });
      let tokenType = token.tokenType;
      if (tokenType == 721) {
        let account = await getAccountInfo(token.owner);
        offers.push({
          contractAddress: offer.minter,
          tokenID: offer.tokenID,
          name: token.name,
          thumbnailPath: token.thumbnailPath,
          imageURL: token.imageURL,
          quantity: offer.quantity,
          pricePerItem: offer.pricePerItem,
          paymentToken: offer.paymentToken,
          deadline: offer.deadline,
          createdAt: offer._id.getTimestamp(),
          alias: account ? account[0] : null,
          image: account ? account[1] : null,
        });
      } else {
        offers.push({
          contractAddress: offer.minter,
          tokenID: offer.tokenID,
          name: token.name,
          thumbnailPath: token.thumbnailPath,
          imageURL: token.imageURL,
          quantity: offer.quantity,
          pricePerItem: offer.pricePerItem,
          paymentToken: offer.paymentToken,
          deadline: offer.deadline,
          createdAt: offer._id.getTimestamp(),
        });
      }
    });
    await Promise.all(promise);
    return res.json({
      status: "success",
      data: offers,
    });
  } catch (error) {
    Logger.error(error);
    return res.json({
      status: "failed",
      data: [],
    });
  }
});

router.get("/getActivityFromOthers/:address", async (req, res) => {
  try {
    let address = toLowerCase(req.params.address);
    /* get holding token [tokenID, minter] pair */
    let holdings = [];
    let offers = [];
    let tmp = await NFTITEM.find({
      owner: address,
    }).select(["contractAddress", "tokenID"]);
    tmp.map((tk) => {
      holdings.push([tk.tokenID, tk.contractAddress]);
    });
    tmp = await ERC1155HOLDING.find({
      holderAddress: address,
    }).select(["contractAddress", "tokenID"]);
    tmp.map((tk) => {
      holdings.push([tk.tokenID, tk.contractAddress]);
    });

    let promise = holdings.map(async (hold) => {
      let offer = await Offer.findOne({
        minter: hold[1],
        tokenID: hold[0],
      }).select([
        "creator",
        "tokenID",
        "quantity",
        "pricePerItem",
        "paymentToken",
        "deadline",
        "minter",
      ]);
      if (offer) {
        if (offer.creator != address) {
          let account = await getAccountInfo(offer.creator);
          let token = await NFTITEM.findOne({
            contractAddress: offer.minter,
            tokenID: offer.tokenID,
          });
          offers.push({
            creator: offer.creator,
            contractAddress: offer.minter,
            tokenID: offer.tokenID,
            name: token.name,
            thumbnailPath: token.thumbnailPath,
            imageURL: token.imageURL,
            quantity: offer.quantity,
            pricePerItem: offer.pricePerItem,
            paymentToken: offer.paymentToken,
            deadline: offer.deadline,
            createdAt: offer._id.getTimestamp(),
            alias: account ? account[0] : null,
            image: account ? account[1] : null,
          });
        }
      }
    });
    await Promise.all(promise);
    return res.json({
      status: "success",
      data: offers,
    });
  } catch (error) {
    Logger.error(error);
    return res.status(400).json({
      status: "failed",
    });
  }
});

router.get("/getFigures/:address", async (req, res) => {
  try {
    let address = toLowerCase(req.params.address);
    let singleItems721 = await NFTITEM.find({
      owner: address,
      isAppropriate: true,
      tokenType: 721,
      thumbnailPath: { $nin: [".", "non-image"] },
    });
    let single721 = singleItems721.length;
    let singleItems1155 = await ERC1155HOLDING.find({
      holderAddress: address,
      supplyPerHolder: { $gt: 0 },
    });
    let single1155 = singleItems1155.length;
    let single = single721 + single1155;
    let bundles = await Bundle.find({ owner: address });
    let bundle = bundles.length;
    let favNFT = await Like.find({ follower: address });
    let favBundle = await BundleLike.find({ follower: address });
    let fav = favNFT.length + favBundle.length;
    return res.json({
      status: "success",
      data: {
        single,
        bundle,
        fav,
      },
    });
  } catch (error) {
    Logger.error(error);
    return res.json({
      status: "failed",
    });
  }
});

router.get("/price/:token", (req, res) => {
  try {
    let token = req.params.token;
    return res.json({
      status: "success",
      data: getPrice(token),
    });
  } catch (error) {
    Logger.error(error);
    return res.json({
      status: "failed",
    });
  }
});

router.get("/getDecimals/:address", async (req, res) => {
  try {
    let address = req.params.address;
    let decimal = await getDecimals(address);
    return res.json({
      data: decimal,
    });
  } catch (error) {
    Logger.error(error);
    return res.json({
      data: 0,
    });
  }
});

const getAccountInfo = async (address) => {
  try {
    let account = await Account.findOne({ address: address });
    if (account) {
      return [account.alias, account.imageHash];
    } else {
      return null;
    }
  } catch (error) {
    Logger.error(error);
    return null;
  }
};
module.exports = router;
