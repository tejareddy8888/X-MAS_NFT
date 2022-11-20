const { ethers } = require("hardhat");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const nftAccessToken = await ethers.getContractFactory("NFTAccessToken");
  const deployedNftAccessToken = await nftAccessToken.deploy();
  await deployedNftAccessToken.deployed();

  console.log("NFT Access Token deployed address:", deployedNftAccessToken.address);

  const NFTFactoryToken = await ethers.getContractFactory("XmasNFT");
  const deployedNFTFactoryToken = await NFTFactoryToken.deploy();
  await deployedNFTFactoryToken.deployed();

  console.log("NFT Factory Token address:", deployedNFTFactoryToken.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
