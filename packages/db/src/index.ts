import { knex as createKnex, type Knex } from 'knex';

const environment =
  process.env.NODE_ENV === 'test'
    ? 'test'
    : process.env.NODE_ENV === 'production'
      ? 'production'
      : 'development';

const connectionMap: Record<string, string | undefined> = {
  test: process.env.DATABASE_TEST_URL,
  development: process.env.DATABASE_URL,
  production: process.env.DATABASE_PROD,
};

const connection = connectionMap[environment];

export const db: Knex = createKnex({
  client: 'pg',
  connection,
  pool: { min: 2, max: 10 },
});

export default db;
export type { Knex };
