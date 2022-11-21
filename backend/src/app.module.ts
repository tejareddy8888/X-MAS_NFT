import { MiddlewareConsumer, Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule, RequestLoggerMiddleware } from './logger';
import { Web3Module } from './web3';

@Module({
  imports: [Web3Module, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('/');
  }
}
