import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Web3Service } from './web3.service';

class AddressDto {
  @ApiProperty({ type: 'string' })
  address: string;
}

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

  @Post('mint')
  async faucetMint(@Body() request: AddressDto): Promise<string> {
    const { address } = request;
    return await this.web3Service.faucetMint(address);
  }

  @Get('nft/:tokenId')
  async getNft(@Param('tokenId') tokenId: string): Promise<string> {
    return await this.getNft(tokenId);
  }
}
