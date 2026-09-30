const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: 'postgresql://postgres:master@localhost:5433/postgres' });
  await c.connect();
  await c.query('CREATE DATABASE ajaia_docs_test');
  console.log('TEST-DB-CREATED');
  await c.end();
})().catch((e) => { console.log('DB-CREATE:' + e.message); });