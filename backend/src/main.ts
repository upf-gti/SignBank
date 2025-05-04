import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  // Validate environment variables before starting the app
  
  const app = await NestFactory.create(AppModule);
  
  // Apply ValidationPipe globally to enforce DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    }),
  );
  
  await app.listen(process.env.PORT);
  console.log(`Server started on URL: ${process.env.BASE_URL}`);
  console.log(`Server started on port ${process.env.PORT}`);
}
bootstrap();
