import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'https://main.d2mwojyqore1ov.amplifyapp.com',
    methods: 'GET,POST,PUT,DELETE,OPTIONS', // Incluye OPTIONS
    allowedHeaders: 'Content-Type, Authorization',
  });

  await app.listen(3000);

}
bootstrap();
