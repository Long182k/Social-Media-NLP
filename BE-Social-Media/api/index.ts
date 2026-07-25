import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

const server = express();
let isInitialized = false;

async function initServer() {
  if (!isInitialized) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { logger: ['error', 'warn', 'log'] },
    );

    app.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    app.use(cookieParser());

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
    isInitialized = true;
  }
}

export default async function handler(req: any, res: any) {
  if (req.url === '/' || req.url === '/health' || req.url === '/api/health') {
    return res.status(200).json({
      status: 'online',
      service: 'Social Media NLP Backend',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    await initServer();
    return server(req, res);
  } catch (error: any) {
    console.error('NestJS Initialization Error:', error);
    return res.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: error?.message || 'Failed to initialize NestJS application',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
  }
}
