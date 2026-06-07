import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { getCorsOrigins, validateEnvironment } from './config/env.validation';

async function bootstrap() {
  validateEnvironment();

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: getCorsOrigins(),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server started on URL: ${process.env.BASE_URL}`);
  console.log(`Server started on port ${port}`);
}
bootstrap();
