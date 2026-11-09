import { config } from 'dotenv';
import { join } from 'node:path';
import { defineConfig, env } from 'prisma/config';

config({ path: join(__dirname, '../../.env') });
config();

export default defineConfig({
  schema: 'prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
});
