import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  const configService = app.get(ConfigService);

  // Fixed port retrieval
  const port = configService.get<number>('APP_PORT') ?? (process.env.APP_PORT ? parseInt(process.env.APP_PORT) : undefined);

  if (port === undefined) {
    throw new Error('PORT is not defined in config or environment variables');
  }

  await app.listen(port);
  console.log(`App running on port ${port}`);
}
bootstrap();
