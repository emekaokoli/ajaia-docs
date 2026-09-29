import pkg from 'knex';
import config from './config.mts';

const { knex } = pkg;

type ConfigKeys = keyof typeof config;

const allowedEnvs: ConfigKeys[] = [
  'test',
  'development',
  'staging',
  'production',
];
const nodeEnv = process.env.NODE_ENV;

const environment: ConfigKeys =
  allowedEnvs.find((env) => env === nodeEnv) || 'development';

const database = knex(config[environment]);

export default database;
