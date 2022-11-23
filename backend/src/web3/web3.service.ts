import { Injectable } from '@nestjs/common';
import { ethers, Contract, BigNumber } from 'ethers';
import { NonceManager } from '@ethersproject/experimental';

import { ERC20 as ERC20Abi } from './abis/ERC20';
import { ERC721 as ERC721Abi } from './abis';
import { IpfsService } from 'src/ipfs';
import { NftTokenDetails, StarDetailsDto } from 'src/types';
import { NFTLogger } from 'src/logger';

@Injectable()
export class Web3Service {
  private readonly logger: NFTLogger;
  protected provider: ethers.providers.JsonRpcProvider;
  protected accessToken: Contract;
  protected nftContract?: Contract;
  protected signer: NonceManager;
  protected accessTokenInterface: ethers.utils.Interface;

  constructor(private readonly ipfsService: IpfsService) {
    this.logger = new NFTLogger(Web3Service.name);
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
    const tx = await this.accessToken.mint(address, { gasLimit: 200_000 });
    return tx.hash;
  }

  async onlyUpload(file: Express.Multer.File): Promise<string> {
    return await this.ipfsService.uploadImage({
      path: '/test.jpeg',
      content: file.buffer,
    });
  }

  async mintNFT(sender: string, ipfsCid: string): Promise<string> {
    const registeredStatus = await this.getRegistrationStatus(sender);
    if (!registeredStatus) {
      throw Error('Account mentioned is not registered with us');
    }
    const tx = await this.nftContract.mint(sender, ipfsCid);
    return tx.hash;
  }

  async getNFTFromIPFSCID(cid: string): Promise<string> {
    const response = await this.ipfsService.showImage(cid);
    return Buffer.from(response).toString('base64');
  }

  async getStarDetails(address: string): Promise<string> {
    const registeredStatus = await this.getRegistrationStatus(address);
    const balance = await this.getBalance(address);
    if (!registeredStatus || BigNumber.from(balance).gt(0)) {
      throw Error(
        'Account mentioned is not registered or did not burn the access token ',
      );
    }
    const response = await this.accessToken.queryFilter(
      this.accessToken.filters.StarDetails(address),
    );
    if (!response.length) {
      return '';
    }

    const parsedEvent = this.accessTokenInterface.parseLog(response[0]);
    return parsedEvent.args.data;
  }

  async getAllStarDetails(): Promise<StarDetailsDto[]> {
    const response = await this.accessToken.queryFilter(
      this.accessToken.filters.StarDetails(null),
    );

    if (!response.length) {
      return [];
    }
    return response.map((e) => {
      return {
        address: e.args.user,
        starDetails: e.args.data,
      };
    });
  }

  async getNftIdsOwnedByUser(user: string): Promise<string[]> {
    const response = await this.nftContract.queryFilter(
      this.nftContract.filters.Transfer(null, user),
    );

    if (!response.length) {
      return [];
    }
    return response.map((e) => BigNumber.from(e.args.tokenId).toString());
  }

  async getTokenUriFromNFTId(tokenId: string): Promise<string> {
    return await this.nftContract.tokenURI(tokenId);
  }

  async getNfts(user: string): Promise<NftTokenDetails[]> {
    const response = await this.getNftIdsOwnedByUser(user);
    if (!response.length) {
      return [];
    }
    return await Promise.all(
      response.map(async (tokenID) => {
        const tokenUri = await this.getTokenUriFromNFTId(tokenID);
        return {
          tokenID,
          ipfsURL: `https://${tokenUri}.ipfs.dweb.link/`,
        };
      }),
    );
  }
}
