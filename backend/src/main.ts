import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API Server')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, swaggerDoc);

  await app.listen(3001);
}
bootstrap();
