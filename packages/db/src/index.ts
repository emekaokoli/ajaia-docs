import knex from 'knex';

const environment =
  process.env.NODE_ENV === 'test'
    ? 'test'
    : process.env.NODE_ENV === 'production'
      ? 'production'
      : 'development';

const connection = {
  test: process.env.DATABASE_TEST_URL,
  development: process.env.DATABASE_DEV_URL,
  production: process.env.DATABASE_URL_DOCKER,
}[environment];

const database = knex({ client: 'postgresql', connection });

export default database;
