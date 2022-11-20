require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");
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
    },
    goerli: {
      chainId: 5,
      url: process.env.NETWORK_URL,
      accounts: [
        process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY : "",
      ],
    },
    uzheth: {
      chainId: 8888,
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
