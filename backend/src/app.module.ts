import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Web3Module } from './web3';

@Module({
  imports: [Web3Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
