import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

async function bootstrap() {
  const env = process.env.NODE_ENV;
  if (env) {
    dotenv.config({ path: `.env.${env}` });
  } else {
    dotenv.config();
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
