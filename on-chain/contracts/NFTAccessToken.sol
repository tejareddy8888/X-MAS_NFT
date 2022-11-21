//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

// We import this library to be able to use console.log
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// This is the main building block for smart contracts.
contract NFTAccessToken is ERC20, Ownable {
    error CannotReRegister();
    mapping(address => bool) registry;

    event StarDetails(address indexed user, string data);

    /**
     * Contract initialization.
     */
    constructor() ERC20("NFT ACCESS TOKEN", "NAT") {}

    receive() external payable {}

    /**
     * @dev Returns the address of the current owner.
     */
    function registrationStatus(address account) public view returns (bool) {
        return registry[account];
    }

    /**
     * A function to mint access token and .
     *
     * The `external` modifier makes a function *only* callable from outside
     * the contract.
     */
    function mint(address payable to) external onlyOwner {
        if (registry[to] == true) {
            revert CannotReRegister();
        }
        registry[to] = true;
        _mint(to, 1);
        to.transfer(20220000000000000);
    }

    /**
     * A function to transfer tokens.
     *
     * The `external` modifier makes a function *only* callable from outside
     * the contract.
     */
    function burnWith(string calldata starDetails) external {
        assert(registry[msg.sender] == true);
        _burn(msg.sender, 1);
        emit StarDetails(msg.sender, starDetails);
    }

    function withdrawAll() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
