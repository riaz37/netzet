import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [resolve(__dirname, 'entities', '*.entity.{ts,js}')],
  migrations: [resolve(__dirname, 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  logging: process.env.NODE_ENV === 'development',
  ssl:
    process.env.DATABASE_URL?.includes('ssl') ||
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});
