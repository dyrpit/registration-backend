import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

const mode =
  process.env.NODE_ENV === 'production' ? process.env.NODE_ENV : 'development';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const origin =
    mode === 'development' ? 'http://localhost:3001' : process.env.ORIGIN;

  app.enableCors({ origin, credentials: true });
  app.use(cookieParser());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
