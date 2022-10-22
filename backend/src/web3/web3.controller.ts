import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Web3Service } from './web3.service';

interface RegistryDto {
  address: string;
}

interface NftDto {
  address: string;
  nftHash: string;
}

@Controller('web3')
export class Web3Controller {
  constructor(private readonly web3Service: Web3Service) {}

  @Get('balance/:address')
  async getBalance(@Param('address') address: string): Promise<string> {
    return await this.web3Service.getBalance(address);
  }

  @Get('registry/:address')
  async getRegistry(@Param('address') address: string): Promise<boolean> {
    // TODO: returns true when there is an address in the registry
    return false;
  }

  @Post('registry/register')
  async postRegistry(@Body() registryData: RegistryDto): Promise<string> {
    // TODO: receives the user address and returns status
    return '<txHash from the contract or sth else>';
  }

  @Post('nft/burn-with')
  async postNftBurnWith(@Body() nftData: NftDto): Promise<string> {
    // TODO: burn the access token and mint the NFT
    return '<txHash or the ipfsHash>';
  }

  @Get('nft/:address')
  async getNft(@Param('address') address: string): Promise<string> {
    // TODO: return the ipfs hash for the address
    return '<ipfsHash of the NFT>';
  }
}
