import dotenv from 'dotenv';
import type { Knex } from 'knex';
import { resolve } from 'node:path';

dotenv.config({ path: resolve(__dirname, '../../apps/server/.env') });

const devConnection = process.env.DATABASE_URL;
const testConnection = process.env.DATABASE_TEST_URL;

const config: Record<'development' | 'test' | 'production', Knex.Config> = {
  development: {
    client: 'pg',
    connection: devConnection,
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './src/migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: { directory: './src/seeds', extension: 'ts' },
  },

  test: {
    client: 'pg',
    connection: testConnection,
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './src/migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: { directory: './src/seeds', extension: 'ts' },
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './dist/migrations',
      tableName: 'knex_migrations',
      extension: 'js',
    },
    seeds: { directory: './dist/seeds', extension: 'js' },
  },
};

export default config;
