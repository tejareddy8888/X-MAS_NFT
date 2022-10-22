import { Injectable } from '@nestjs/common';

import { ethers, Contract, BigNumber } from 'ethers';
import { NonceManager } from '@ethersproject/experimental';

import { ERC20 as ERC20Abi } from './abis/ERC20';
import { ERC721 as ERC721Abi } from './abis';
import { IpfsService } from 'src/ipfs';

@Injectable()
export class Web3Service {
  protected provider: ethers.providers.JsonRpcProvider;
  protected accessToken: Contract;
  protected nftContract?: Contract;
  protected signer: NonceManager;
  protected accessTokenInterface: ethers.utils.Interface;

  constructor(private readonly ipfsService: IpfsService) {
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.NETWORK_URL,
    );

    this.accessTokenInterface = new ethers.utils.Interface(
      JSON.stringify(ERC20Abi),
    );

    this.accessToken = new Contract(
      process.env.ACCESS_TOKEN_ADDRESS,
      JSON.stringify(ERC20Abi),
      this.provider,
    );

    this.nftContract = new Contract(
      process.env.NFT_TOKEN_ADDRESS,
      JSON.stringify(ERC721Abi),
      this.provider,
    );

    if (process.env.ADMIN_MNEMONIC) {
      this.signer = new NonceManager(
        ethers.Wallet.fromMnemonic(process.env.ADMIN_MNEMONIC),
      ).connect(this.provider);
    }

    if (process.env.ADMIN_PRIVATEKEY) {
      this.signer = new NonceManager(
        new ethers.Wallet(process.env.ADMIN_PRIVATEKEY, this.provider),
      );
    }
    this.accessToken = this.accessToken.connect(this.signer);

    this.nftContract = this.nftContract.connect(this.signer);
  }

  async getBalance(address: string): Promise<string> {
    return BigNumber.from(await this.accessToken.balanceOf(address)).toString();
  }

  async getRegistrationStatus(address: string): Promise<boolean> {
    return await this.accessToken.registrationStatus(address);
  }

  async faucetMint(address: string): Promise<string> {
    const tx = await this.accessToken.mint(address);
    await tx.wait(1);
    return tx.hash;
  }

  async getNFTDetails(tokenId: string): Promise<string> {
    return await this.nftContract.tokenURI(tokenId);
  }

  async mintNFT(sender: string, tokenTxt: string): Promise<string> {
    const ipfsCID = await this.ipfsService.uploadImage({
      path: '/test-avatar.jpeg',
      content: tokenTxt,
    });

    const tx = await this.nftContract.mintNFT(sender, ipfsCID);
    await tx.wait(1);
    return tx.hash;
  }

  async getNFTFromIPFS(cid: string): Promise<string> {
    return await this.ipfsService.showImage(cid);
  }

  async getStarPosition(address: string): Promise<string> {
    const response = await this.accessToken.queryFilter(
      this.accessToken.filters.StarPosition(address),
    );
    const parsedEvent = this.accessTokenInterface.parseLog(response[0]);
    return parsedEvent.args.data;
  }
}
