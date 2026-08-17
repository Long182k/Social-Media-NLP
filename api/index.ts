process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_knzcaILw5O9A@ep-super-bird-az3gx34q-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'super_secret_jwt_access_token_key_2026';
}
if (!process.env.REFRESH_JWT_SECRET) {
  process.env.REFRESH_JWT_SECRET = 'super_secret_jwt_refresh_token_key_2026';
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../BE-Social-Media/dist/app.module';
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

    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));
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
    const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
    return res.status(200).json({
      status: 'online',
      service: 'Social Media NLP Backend',
      dbHost: dbUrl.substring(0, 30) + '...',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    await initServer();
    return new Promise((resolve, reject) => {
      res.on('finish', resolve);
      res.on('error', reject);
      server(req, res);
    });
  } catch (error: any) {
    console.error('NestJS Serverless Error:', error);
    return res.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: error?.message || String(error),
      stack: error?.stack,
    });
  }
}
