import { Module } from '@nestjs/common';
import { Web3Controller } from './web3.controller';
import { Web3Service } from './web3.service';

import { IpfsModule } from '../ipfs';

@Module({
  imports: [IpfsModule],
  controllers: [Web3Controller],
  providers: [Web3Service],
})
export class Web3Module {}
