// add types to env variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'test' | 'production';
    PORT: string;
    DATABASE_URL: string;
    DATABASE_TEST_URL: string;
    SESSION_SECRET: string;
    SESSION_COOKIE_NAME: string;
  }
}
