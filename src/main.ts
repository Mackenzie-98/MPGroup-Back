import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',  // Permitir cualquier origen
    methods: '*',  // Permitir todos los métodos
    allowedHeaders: '*',  // Permitir todas las cabeceras
  });

  await app.listen(3000);
}
bootstrap();
