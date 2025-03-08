
// BESU
const CollectionFactoryContract = {
  MAINNET_721_PRIVATE: '', //FantomNFTFactoryPrivate
  MAINNET_721_PUBLIC: '', //FantomNFTFactory
  TESTNET_721_PRIVATE: '0x09beC6E6B60edde250A1aF666224C0880d9C69C1', //FantomNFTFactoryPrivate
  TESTNET_721_PUBLIC: '0xf998eaeaf29F65A0EF04a054d086cd7CfE11cc96', //FantomNFTFactory
  MAINNET_1155_PRIVATE: '', //FantomArtFactoryPrivate
  MAINNET_1155_PUBLIC: '', //FantomArtFactory
  TESTNET_1155_PRIVATE: '0xAdF1d9F4fd0a6bfC0DbdED66dd81bE81e0b0F728', //FantomArtFactoryPrivate
  TESTNET_1155_PUBLIC: '0xC01b8cd8490FCD1063640D23f9ec77a1baE42Ea3', //FantomArtFactory
  ABI: [
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'exists',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function'
    }
  ]
};


// Kairos
// const CollectionFactoryContract = {
//   MAINNET_721_PRIVATE: '', //FantomNFTFactoryPrivate
//   MAINNET_721_PUBLIC: '', //FantomNFTFactory
//   TESTNET_721_PRIVATE: '0x8208174474Aa87788da951d06Eddd4578692a451', //FantomNFTFactoryPrivate
//   TESTNET_721_PUBLIC: '0x112b7E46f91986480a482D127880Ad58Db92F7da', //FantomNFTFactory
//   MAINNET_1155_PRIVATE: '', //FantomArtFactoryPrivate
//   MAINNET_1155_PUBLIC: '', //FantomArtFactory
//   TESTNET_1155_PRIVATE: '0xC4eaa61FA83e0D88548Ac0a919900Dac17504520', //FantomArtFactoryPrivate
//   TESTNET_1155_PUBLIC: '0xBD6c01837505db10ECf5Aa04c2B68674466f5aD3', //FantomArtFactory
//   ABI: [
//     {
//       inputs: [{ internalType: 'address', name: '', type: 'address' }],
//       name: 'exists',
//       outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
//       stateMutability: 'view',
//       type: 'function'
//     }
//   ]
// };

module.exports = CollectionFactoryContract;
