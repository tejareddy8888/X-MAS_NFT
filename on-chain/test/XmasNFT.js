// This is an example test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.
const { ethers } = require("hardhat");

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage of Hardhat Network's snapshot functionality.
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.
describe("XmasNFT Contract", function () {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployTokenFixture() {
    // Get the ContractFactory and Signers here.
    const Token = await ethers.getContractFactory("XmasNFT");
    const [owner] = await ethers.getSigners();

    const nft = await Token.deploy();

    await nft.deployed();

    // Create random addresses
    const addr1 = ethers.Wallet.createRandom().connect(ethers.provider);
    const addr2 = ethers.Wallet.createRandom().connect(ethers.provider);

    // Fixtures can return anything you consider useful for your tests
    return { Token, nft, owner, addr1, addr2 };
  }

  async function mintNFT(nft, addr, tokenURI) {
    const txResponse = await nft.mint(addr.address, tokenURI);
    const txReceipt = await txResponse.wait();
    const [transferEvent] = txReceipt.events;
    const { tokenId } = transferEvent.args;
    return tokenId;
  }

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define each
    // of your tests. It receives the test name, and a callback function.
    //
    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // We use loadFixture to setup our environment, and then assert that
      // things went well
      const { nft, owner } = await loadFixture(deployTokenFixture);

      // `expect` receives a value and wraps it in an assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be
      // equal to our Signer's owner.
      expect(await nft.owner()).to.equal(owner.address);
    });

  });

  describe("Mint", function() {

    it("Should be able to mint NFTs", async function () {
      const { nft, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      expect(await nft.balanceOf(addr1.address)).to.equal(0);
      await nft.mint(addr1.address, "");
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      await nft.mint(addr1.address, "");
      expect(await nft.balanceOf(addr1.address)).to.equal(2);

      expect(await nft.balanceOf(addr2.address)).to.equal(0);
      await nft.mint(addr2.address, "foo");
      expect(await nft.balanceOf(addr2.address)).to.equal(1);
    });

    it("The token ids should be unique", async function () {
      const { nft, addr1 } = await loadFixture(
        deployTokenFixture
      );
      const tokenId1 = await mintNFT(nft, addr1, "");
      const tokenId2 = await mintNFT(nft, addr1, "");
      expect(tokenId1).to.not.equal(tokenId2);
    });

    it("Should be able to retrieve the tokenURI", async function () {
      const { nft, addr1 } = await loadFixture(
        deployTokenFixture
      );
      const tokenId1 = await mintNFT(nft, addr1, "foo");
      const tokenURI1 = await nft.tokenURI(tokenId1);

      const tokenId2 = await mintNFT(nft, addr1, "foo");
      const tokenURI2 = await nft.tokenURI(tokenId2);

      expect(tokenURI1).to.equal(tokenURI2);
    });

    it("Should be able to change the baseURI", async function () {
      const { nft, addr1 } = await loadFixture(
        deployTokenFixture
      );
      const tokenId1 = await mintNFT(nft, addr1, "foo");
      const tokenURI1 = await nft.tokenURI(tokenId1);

      await nft.setBaseURI("bar");
      const tokenId2 = await mintNFT(nft, addr1, "foo");
      const tokenURI2 = await nft.tokenURI(tokenId2);

      expect(tokenURI1).to.not.equal(tokenURI2);
    });

  });

  describe("OnlyOwner", function () {

    it("Should not be able to set the baseURI if not owner", async function () {
      const { nft, owner, addr1 } = await loadFixture(
        deployTokenFixture
      );
      // Send some funds to addr1
      await owner.sendTransaction({
        to: addr1.address,
        value: "20220000000000000"
      });
      // Try calling setBaseURI from addr1
      await expect(nft.connect(addr1).setBaseURI("foo")).to.be.reverted;
    });

    it("Should not be able to mint if not owner", async function () {
      const { nft, owner, addr1 } = await loadFixture(
        deployTokenFixture
      );
      // Send some funds to addr1
      await owner.sendTransaction({
        to: addr1.address,
        value: "20220000000000000"
      });
      // Try calling mint from addr1
      await expect(nft.connect(addr1).mint(addr1.address, "")).to.be.reverted;
    });

  });

});
