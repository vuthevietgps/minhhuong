import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { join } from 'node:path';

config({ path: join(process.cwd(), '../../.env') });
config();

export const resolveDatabaseUrl = (environment: NodeJS.ProcessEnv) => {
  const configured = environment.DATABASE_URL?.trim();
  if (configured) return configured;
  if (environment.NODE_ENV?.trim().toLowerCase() === 'production') {
    throw new Error('DATABASE_URL is required before production bootstrap');
  }
  return 'postgresql://minhhuong:minhhuong@localhost:5432/minhhuong?schema=public';
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaPg(resolveDatabaseUrl(process.env)),
      log:
        process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Unknown Prisma connection error';
      console.warn(
        `Prisma is running without a database connection: ${message}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
