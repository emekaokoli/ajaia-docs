import dotenv from 'dotenv';
import type { Knex } from 'knex';
import path from 'path';

dotenv.config();

const { DATABASE_URL_DOCKER, DATABASE_DEV_URL, DATABASE_TEST_URL } =
  process.env;

interface DbConfig {
  test: Knex.Config;
  development: Knex.Config;
  production: Knex.Config;
}

const config: DbConfig = {
  development: {
    client: 'postgresql',
    connection: DATABASE_DEV_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './src/database/seeds',
    },
  },

  test: {
    client: 'postgresql',
    connection: DATABASE_TEST_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './app/database/seeds',
    },
  },

  production: {
    client: 'postgresql',
    connection: DATABASE_URL_DOCKER,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, 'dist', 'src', 'database', 'migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'dist', 'src', 'database', 'seeds'),
    },
  },
};

export default config;
