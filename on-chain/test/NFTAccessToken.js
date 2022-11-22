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
describe("NFTAccessToken Contract", function () {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployTokenFixture() {
    // Get the ContractFactory and Signers here.
    const Token = await ethers.getContractFactory("NFTAccessToken");
    const [owner] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // its deployed() method, which happens once its transaction has been
    // mined.
    const accessToken = await Token.deploy();

    await accessToken.deployed();

    // Send funds to the contract address
    await owner.sendTransaction({
      to: accessToken.address,
      value: "40440000000000000"
    });

    // Create random addresses
    const addr1 = ethers.Wallet.createRandom().connect(ethers.provider);
    const addr2 = ethers.Wallet.createRandom().connect(ethers.provider);

    // Fixtures can return anything you consider useful for your tests
    return { Token, accessToken, owner, addr1, addr2 };
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
      const { accessToken, owner } = await loadFixture(deployTokenFixture);

      // `expect` receives a value and wraps it in an assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be
      // equal to our Signer's owner.
      expect(await accessToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const { accessToken, owner } = await loadFixture(deployTokenFixture);
      const ownerBalance = await accessToken.balanceOf(owner.address);
      expect(await accessToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Mint", function() {

    it("Should be able to register and mint tokens", async function () {
      const { accessToken, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      // Mint token for addr1
      expect(!await accessToken.registrationStatus(addr1.address));
      await accessToken.mint(addr1.address);
      expect(await accessToken.balanceOf(addr1.address)).to.equal(1);
      expect(await accessToken.registrationStatus(addr1.address));

      // Mint token for addr2
      expect(!await accessToken.registrationStatus(addr2.address));
      await accessToken.mint(addr2.address);
      expect(await accessToken.balanceOf(addr2.address)).to.equal(1);
      expect(await accessToken.registrationStatus(addr2.address));

      // Check the ether balance
      expect(await ethers.provider.getBalance(accessToken.address)).to.equal(0);

    });

    it("Should not be able to mint tokens twice", async function () {
      const { accessToken, addr1 } = await loadFixture(
        deployTokenFixture
      );
      // Mint tokens twice for addr1
      await accessToken.mint(addr1.address);
      await expect(accessToken.mint(addr1.address)).to.be.reverted;

    });

  })

  describe("Burn", function() {

    it("Should be able to burn and emit StarDetails event", async function() {
      const { accessToken, addr1 } = await loadFixture(
        deployTokenFixture
      );

      // First mint the token
      await accessToken.mint(addr1.address);

      // Burn the token
      expect(await accessToken.balanceOf(addr1.address)).to.equal(1);
      const starDetails = "foobar";
      await expect(accessToken.connect(addr1).burnWith(starDetails))
        .to.emit(accessToken, "StarDetails").withArgs(addr1.address, starDetails);
      expect(await accessToken.balanceOf(addr1.address)).to.equal(0);

    });

  })

  describe("WithdrawAll", function () {
    it("Should be able to withdraw everything back to owner", async function () {
      const { accessToken, owner } = await loadFixture(
        deployTokenFixture
      );
      const ownerBalance = await ethers.provider.getBalance(owner.address);
      const accessTokenBalance = await ethers.provider.getBalance(accessToken.address);

      // withdraw all ethers
      await accessToken.withdrawAll();
      expect(await ethers.provider.getBalance(accessToken.address)).to.equal(0);
      expect(await ethers.provider.getBalance(owner.address)).to.gte(ownerBalance);

    });

  });

});