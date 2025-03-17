const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

/** Swagger Definition */
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "DressDio API",
      version: "1.0.0",
      description: "APIs for DressDio Services",
    },
    tags: [
      {
        name: "auth",
        description: "APIs for Authentication",
      },
      {
        name: "account",
        description: "APIs for User Account",
      },
    ],
    servers: [
      { url: "http://3.39.39.195:3000", description: "Test Server" },
      {
        url: `http://localhost:${process.env.APP_PORT}`,
        description: "Dev Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Collection: {
          type: "object",
          description:
            "Represents an NFT collection with its metadata and ownership details.",
          properties: {
            erc721Address: {
              type: "string",
              description:
                "The Ethereum smart contract address of the collection.",
            },
            owner: {
              type: "string",
              description: "The wallet address of the collection's owner.",
            },
            email: {
              type: "string",
              description: "The contact email associated with the collection.",
            },
            collectionName: {
              type: "string",
              description: "The name of the NFT collection.",
            },
            description: {
              type: "string",
              description: "A brief description of the collection.",
            },
            categories: {
              type: "array",
              items: { type: "string" },
              description: "A list of categories the collection belongs to.",
            },
            logoImageHash: {
              type: "string",
              description: "IPFS hash of the collection's logo image.",
            },
            siteUrl: {
              type: "string",
              description: "The official website of the collection.",
            },
            discord: {
              type: "string",
              description: "Discord server link for the collection community.",
            },
            twitterHandle: {
              type: "string",
              description: "The Twitter handle of the collection.",
            },
            instagramHandle: {
              type: "string",
              description: "The Instagram handle of the collection.",
            },
            mediumHandle: {
              type: "string",
              description: "The Medium blog handle of the collection.",
            },
            telegram: {
              type: "string",
              description: "The Telegram group link for the collection.",
            },
            status: {
              type: "boolean",
              description: "Indicates whether the collection is active.",
            },
            isInternal: {
              type: "boolean",
              description: "Defines if the collection is internally managed.",
            },
            isOwnerble: {
              type: "boolean",
              description:
                "Indicates if the collection can be owned by multiple users.",
            },
            isAppropriate: {
              type: "boolean",
              description:
                "Specifies if the collection meets content guidelines.",
            },
            feeRecipient: {
              type: "string",
              description: "Wallet address that receives royalty fees.",
            },
            signature: {
              type: "string",
              description:
                "The digital signature proving the authenticity of the collection.",
            },
            signatureAddress: {
              type: "string",
              description:
                "The wallet address used to sign the collection metadata.",
            },
            royalty: {
              type: "number",
              description:
                "The royalty percentage (in basis points) received on secondary sales.",
            },
          },
        },
        CollectionContractResponse: {
          type: "object",
          description: "Contains details with minimum details.",
          properties: {
            address: {
              type: "string",
              description: "The Ethereum contract address of the collection.",
            },
            collectionName: {
              type: "string",
              description: "The name of the collection.",
            },
            description: {
              type: "string",
              description: "A short description of the collection.",
            },
            categories: {
              type: "array",
              items: { type: "string" },
              description: "Categories associated with the collection.",
            },
            logoImageHash: {
              type: "string",
              description: "IPFS hash of the collection's logo.",
            },
            siteUrl: {
              type: "string",
              description: "Official website of the collection.",
            },
            discord: {
              type: "string",
              description: "Discord link for the collection.",
            },
            twitterHandle: {
              type: "string",
              description: "The Twitter handle of the collection.",
            },
            mediumHandle: {
              type: "string",
              description: "The Medium blog handle of the collection.",
            },
            telegram: {
              type: "string",
              description: "Telegram group link of the collection.",
            },
            isVerified: {
              type: "boolean",
              description:
                "Indicates whether the collection has been verified.",
            },
            isVisible: {
              type: "boolean",
              description: "Determines if the collection is publicly visible.",
            },
            isInternal: {
              type: "boolean",
              description: "Defines if the collection is managed internally.",
            },
            isOwnerble: {
              type: "boolean",
              description:
                "Indicates whether the collection can be owned by multiple users.",
            },
          },
        },
        TokenResponse: {
          type: "object",
          description:
            "Represents an NFT token with its metadata and sale details.",
          properties: {
            contentType: {
              type: "string",
              description:
                "The type of content (e.g., image, video, 3D model).",
            },
            contractAddress: {
              type: "string",
              description: "The contract address of the NFT.",
            },
            imageURL: {
              type: "string",
              description: "The URL to the NFT image or media.",
            },
            name: {
              type: "string",
              description: "The name of the NFT.",
            },
            price: {
              type: "number",
              description: "The listing price of the NFT.",
            },
            paymentToken: {
              type: "string",
              description: "The token used for payment (e.g., ETH, USDC).",
            },
            priceInUSD: {
              type: "number",
              description: "The NFT price converted to USD.",
            },
            supply: {
              type: "number",
              description: "The total supply of this NFT (for ERC1155 tokens).",
            },
            tokenID: {
              type: "number",
              description: "The unique identifier of the NFT.",
            },
            tokenType: {
              type: "number",
              description: "The type of NFT (e.g., ERC721 or ERC1155).",
            },
            tokenURI: {
              type: "string",
              description: "Metadata URL for the NFT.",
            },
            liked: {
              type: "number",
              description: "Number of likes received on the NFT.",
            },
            _id: {
              type: "string",
              description: "Unique identifier for the NFT.",
            },
            lastSalePrice: {
              type: "number",
              description: "The last recorded sale price of the NFT.",
            },
            lastSalePricePaymentToken: {
              type: "string",
              description:
                "The payment token used for the last recorded sale (e.g., ETH, USDC).",
            },
            lastSalePriceInUSD: {
              type: "number",
              description:
                "The last recorded sale price of the NFT converted to USD.",
            },
            isAppropriate: {
              type: "boolean",
              description:
                "Specifies if the collection meets content guidelines.",
            },
          },
        },
        SingleItemDetailsResponse: {
          type: "object",
          description: "Detailed response object for a single NFT item.",
          properties: {
            tokenType: {
              type: "number",
              description: "The type of token (e.g., 721 or 1155).",
            },
            likes: {
              type: "number",
              description: "The number of likes the NFT has received.",
            },
            uri: {
              type: "string",
              description:
                "The metadata URI containing additional information about the NFT.",
            },
            listings: {
              type: "array",
              description: "Retrieve a list of NFTs available for sale or auction",
              items: {
                type: "object",
                properties: {
                  quantity: {
                    type: "number",
                    description: "Number of NFTs in the listing",
                  },
                  startTime: {
                    type: "string",
                    description: "Start time of the listing",
                  },
                  owner: {
                    type: "string",
                    description: "Wallet address of the NFT owner",
                  },
                  minter: {
                    type: "string",
                    description: "Wallet address of the NFT minter",
                  },
                  tokenID: {
                    type: "number",
                    description: "Unique identifier for the NFT",
                  },
                  price: {
                    type: "number",
                    description: "Price of the NFT in paytoken",
                  },
                  priceInUSD: {
                    type: "number",
                    description: "Price of the NFT in USD",
                  },
                  paymentToken: {
                    type: "string",
                    description: "Payment token used for NFT transaction",
                  },
                  // alias: {
                  //   type: "string",
                  //   description: "Account alias, if available",
                  // },
                  // image: {
                  //   type: "string",
                  //   description: "Account image, if available",
                  // },
                }
              }
            },
            history: {
              type: "array",
              description: "A list of past trade history related to the NFT.",
              items: {
                type: "object",
                properties: {
                  from: {
                    type: "string",
                    description: "The wallet address of the seller.",
                  },
                  to: {
                    type: "string",
                    description: "The wallet address of the buyer.",
                  },
                  tokenID: {
                    type: "number",
                    description: "The token ID of the NFT being transferred.",
                  },
                  price: {
                    type: "number",
                    description:
                      "The price of the NFT in its original payment token.",
                  },
                  paymentToken: {
                    type: "string",
                    description: "The payment token used for the transaction.",
                  },
                  priceInUSD: {
                    type: "number",
                    description: "The transaction price converted to USD.",
                  },
                  value: {
                    type: "number",
                    description:
                      "The total value exchanged in the transaction.",
                  },
                  createdAt: {
                    type: "string",
                    description:
                      "The timestamp when the transaction was created.",
                  },
                  // isAuction: {
                  //   type: "boolean",
                  //   description:
                  //     "Indicates whether the transaction was part of an auction.",
                  // },
                },
              },
            },
            // nfts: {
            //   type: "array",
            //   items: {
            //     type: "object",
            //     description:
            //       "A list of related NFTs within the same collection or contract.",
            //     properties: {
            //       _id: {
            //         type: "string",
            //         description:
            //           "Unique identifier for the NFT in the database.",
            //       },
            //       thumbnailPath: {
            //         type: "string",
            //         description: "URL of the NFT’s thumbnail image.",
            //       },
            //       supply: {
            //         type: "number",
            //         description: "The total supply of this specific NFT.",
            //       },
            //       price: {
            //         type: "number",
            //         description:
            //           "The current price of the NFT in its original payment token.",
            //       },
            //       paymentToken: {
            //         type: "string",
            //         description: "The token used for the payment.",
            //       },
            //       priceInUSD: {
            //         type: "number",
            //         description: "The price of the NFT converted to USD.",
            //       },
            //       lastSalePrice: {
            //         type: "number",
            //         description:
            //           "The last recorded sale price in its original payment token.",
            //       },
            //       lastSalePricePaymentToken: {
            //         type: "string",
            //         description:
            //           "The token used for the last sale transaction.",
            //       },
            //       lastSalePriceInUSD: {
            //         type: "number",
            //         description: "The last sale price converted to USD.",
            //       },
            //       tokenType: {
            //         type: "number",
            //         description: "The type of token (e.g., 721, 1155).",
            //       },
            //       liked: {
            //         type: "number",
            //         description: "The number of likes received by the NFT.",
            //       },
            //       isAppropriate: {
            //         type: "boolean",
            //         description:
            //           "Indicates whether the NFT meets content guidelines.",
            //       },
            //       contractAddress: {
            //         type: "string",
            //         description:
            //           "The smart contract address associated with this NFT.",
            //       },
            //       tokenID: {
            //         type: "number",
            //         description: "The unique token ID within its contract.",
            //       },
            //       name: { type: "string", description: "The name of the NFT." },
            //       tokenURI: {
            //         type: "string",
            //         description: "The metadata URI of the NFT.",
            //       },
            //       imageURL: {
            //         type: "string",
            //         description: "The URL of the NFT’s primary image.",
            //       },
            //     },
            //   },
            // },
          },
        },
        CollectionInfoResponse: {
          type: "object",
          description: "Detailed information about an NFT collection.",
          properties: {
            isVerified: {
              type: "boolean",
              description:
                "Indicates whether the collection has been verified.",
            },
            categories: {
              type: "array",
              items: { type: "string" },
              description: "Categories associated with the collection.",
            },
            collectionName: {
              type: "string",
              description: "The name of the collection.",
            },
            description: {
              type: "string",
              description: "A short description of the collection.",
            },
            email: {
              type: "string",
              description: "The contact email associated with the collection.",
            },
            erc721Address: {
              type: "string",
              description: "The Ethereum contract address of the collection.",
            },
            isInternal: {
              type: "boolean",
              description: "Defines if the collection is internally managed.",
            },
            logoImageHash: {
              type: "string",
              description: "IPFS hash of the collection's logo.",
            },
            owner: {
              type: "string",
              description: "The wallet address of the collection's owner.",
            },
            status: {
              type: "boolean",
              description: "Indicates whether the collection is active.",
            },
            isOwnerble: {
              type: "boolean",
              description:
                "Indicates whether the collection can be owned by multiple users.",
            },
            isAppropriate: {
              type: "boolean",
              description:
                "Specifies if the collection meets content guidelines.",
            },
          },
        },
        MintableCollectionResponse: {
          type: "object",
          properties: {
            collectionName: {
              type: "string",
              description: "The name of the mintable collection.",
            },
            erc721Address: {
              type: "string",
              description:
                "The Ethereum contract address of the mintable collection.",
            },
            logoImageHash: {
              type: "string",
              description: "IPFS hash of the collection's logo image.",
            },
            type: {
              type: "string",
              description: "The type of collection (e.g., ERC721, ERC1155).",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsDoc(swaggerOptions);
module.exports = {
  specs,
  swaggerUi,
};
