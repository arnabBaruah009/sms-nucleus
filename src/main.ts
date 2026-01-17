import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app
    .listen(process.env.PORT ?? 3000)
    .then(() => {
      console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
    })
    .catch((error) => {
      console.error(error);
    });
}
bootstrap();
