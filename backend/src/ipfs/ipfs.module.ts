import { Module } from '@nestjs/common';

import { IpfsService } from './ipfs.service';

@Module({
  imports: [],
  controllers: [],
  providers: [IpfsService],
  exports: [IpfsService],
})
export class IpfsModule {}
