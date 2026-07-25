import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Connect to MYSQL successfully');
    } catch (error) {
      console.error('Failed to connect to MySQL database during startup:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('Disconnect to MYSQL successfully');
    } catch (error) {
      console.error('Error disconnecting from MySQL:', error);
    }
  }
}
