import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NFT Backend Server')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, swaggerDoc);

  app.enableCors();

  await app.listen(3000);
}
bootstrap();
