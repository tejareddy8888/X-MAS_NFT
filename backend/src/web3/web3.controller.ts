import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Web3Service } from './web3.service';
import { memoryStorage } from 'multer';

import Path = require('path');

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
    return await this.web3Service.getNFTFromIPFSCID(cid);
  }

  @Post('nft/mint')
  async mintNFT(@Body() request: NftDto): Promise<string> {
    const { address, ipfsCid } = request;
    return await this.web3Service.mintNFT(address, ipfsCid);
  }

  @Post('ipfs/upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.web3Service.onlyUpload(file);
  }

  @Get('starPosition/:address')
  async getStarPosition(@Param('address') address: string): Promise<string> {
    return await this.web3Service.getStarPosition(address);
  }
}
