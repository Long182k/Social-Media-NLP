import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const url =
      process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')
        ? process.env.DATABASE_URL
        : 'postgresql://neondb_owner:npg_knzcaILw5O9A@ep-super-bird-az3gx34q-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
    super({
      datasources: {
        db: {
          url,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Connected to PostgreSQL successfully');
    } catch (error) {
      console.error('Failed to connect to PostgreSQL database during startup:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('Disconnected from PostgreSQL successfully');
    } catch (error) {
      console.error('Error disconnecting from PostgreSQL:', error);
    }
  }
}
