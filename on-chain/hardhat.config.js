require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");

const dotenv = require("dotenv");

dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 1337, // We set 1337 to make interacting with MetaMask simpler
      accounts: [
        {
          privateKey:
            process.env.PRIVATE_KEY !== undefined
              ? process.env.PRIVATE_KEY
              : "",
          balance: "100000000000000000000",
        },
      ],
      gas: 2000000,
    },
    goerli: {
      chainId: parseInt(process.env.NETWORK_CHAINID),
      url: process.env.NETWORK_URL,
      accounts: [
        process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY : "",
      ],
    },
    uzheth: {
      chainId: parseInt(process.env.NETWORK_CHAINID),
      url: process.env.NETWORK_URL,
      accounts: [
        process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY : "",
      ],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
