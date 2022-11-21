import { Module } from '@nestjs/common';

import { NFTLogger } from './logger.service';

@Module({
  controllers: [],
  providers: [NFTLogger],
  exports: [NFTLogger],
})
export class LoggerModule {}
