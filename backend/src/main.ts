import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  // Validate environment variables before starting the app
  
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: [process.env.BASE_URL], // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Apply ValidationPipe globally to enforce DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  
  await app.listen(process.env.PORT);
  console.log(`Server started on URL: ${process.env.BASE_URL}`);
  console.log(`Server started on port ${process.env.PORT}`);
}
bootstrap();
