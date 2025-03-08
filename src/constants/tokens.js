const DISABLED_PAYTOKENS = process.env.NETWORK_CHAINID === "8217" ? [
    {
      address: '0x0000000000000000000000000000000000000000',
      name: 'Fantom',
      symbol: 'ftm',
      decimals: 18,
    }
  ] :
  [
    {
      address: '0x0000000000000000000000000000000000000000',
      name: 'Fantom',
      symbol: 'ftm',
      decimals: 18,
    }
  ]


const PAYTOKENS = process.env.NETWORK_CHAINID === "8217" ? [
    {
      address: '0xD7D34Bc25E1139987e2318d49eEFfc272472fc09',
      name: 'DressDio Token',
      symbol: 'DT',
      decimals: 18,
    }
  ] :
  [
    {
      address: '0xD7D34Bc25E1139987e2318d49eEFfc272472fc09',
      name: 'DressDio Token',
      symbol: 'DT',
      decimals: 18,
    },
  ]

module.exports = { PAYTOKENS, DISABLED_PAYTOKENS };
