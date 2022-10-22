import { Injectable } from '@nestjs/common';

import { ethers, Contract, BigNumber } from 'ethers';

import { ERC20 as ERC20Abi } from './abis/ERC20';

@Injectable()
export class Web3Service {
  protected provider: ethers.providers.JsonRpcProvider;
  protected accessToken?: Contract;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.NETWORK_URL,
    );

    this.accessToken = new Contract(
      process.env.ACCESS_TOKEN_ADDRESS,
      JSON.stringify(ERC20Abi),
      this.provider,
    );
  }

  async getBalance(address: string): Promise<string> {
    return BigNumber.from(await this.accessToken.balanceOf(address)).toString();
  }
}
