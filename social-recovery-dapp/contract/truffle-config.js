const HDWalletProvider = require("@truffle/hdwallet-provider");
const { infuraProjectId, mnemonic } = require('./secrets.json');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    sepolia: {
      provider: () => new HDWalletProvider(
        mnemonic, `https://sepolia.infura.io/v3/${infuraProjectId}`
      ),
      network_id: 11155111,  // Sepolia's network id
      gas: 4000000
    }
  },
  compilers: {
    solc: {
      version:"0.8.0",
    }
  }
};
