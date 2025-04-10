import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function validateEnvs() {
  const requiredEnvs = ['PORT', 'DATABASE_URL', 'TYPESENSE_API_KEY']; // Add all required env variables here
  
  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
  
  if (missingEnvs.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvs.join(', ')}`);
  }
}

async function bootstrap() {
  // Validate environment variables before starting the app
  validateEnvs();
  
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT);
  console.log(`Server started on port ${process.env.PORT}`);
}
bootstrap();
