import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { Web3Service } from './web3.service';

import { AddressDto, NftDto } from '../types';

@Controller('web3')
export class Web3Controller {
  constructor(private readonly web3Service: Web3Service) {}

  @Get('balance/:address')
  async getBalance(@Param('address') address: string): Promise<string> {
    return await this.web3Service.getBalance(address);
  }

  @Get('registry/:address')
  async getRegistrationStatus(
    @Param('address') address: string,
  ): Promise<boolean> {
    return this.web3Service.getRegistrationStatus(address);
  }

  @Post('faucet')
  async faucetMint(@Body() request: AddressDto): Promise<string> {
    const { address } = request;
    return await this.web3Service.faucetMint(address);
  }

  @Get('nft/:tokenId')
  async getNft(@Param('tokenId') tokenId: string): Promise<string> {
    return await this.web3Service.getNFTDetails(tokenId);
  }

  @Get('ipfs/:cid')
  async fetch(@Param('cid') cid: string): Promise<string> {
    return await this.web3Service.getNFTFromIPFS(cid);
  }

  @Post('nft/mint')
  async mintNFT(@Body() request: NftDto): Promise<string> {
    const { address, tokenText } = request;
    return await this.web3Service.mintNFT(address, tokenText);
  }

  @Get('starPosition/:address')
  async getStarPosition(@Param('address') address: string): Promise<string> {
    return await this.web3Service.getStarPosition(address);
  }
}
