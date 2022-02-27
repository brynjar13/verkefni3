import { readFile } from 'fs/promises';
import pg from 'pg';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';

const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development' } =
  process.env;

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development
// mode, á heroku, ekki á local vél
const ssl = nodeEnv === 'production' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(q, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    if (nodeEnv !== 'test') {
      console.error('unable to query', e);
    }
    return null;
  } finally {
    client.release();
  }
}

export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return query(data.toString('utf-8'));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);

  return query(data.toString('utf-8'));
}

export async function end() {
  await pool.end();
}

export async function listEvents() {
  const q = 'SELECT * FROM events';
  const res = await query(q);
  return res.rows;
}

export async function getEvent(id) {
  if (Number.isNaN(id)) {
    return null;
  }
  const q = 'SELECT * FROM events WHERE id=$1';
  const res = await query(q, [id]);
  if (res && res.rowCount === 1) {
    return res.rows[0];
  }
  return null;
}

export async function getUsers() {
  const q = 'SELECT name, username FROM users';
  const res = await query(q);
  return res.rows;
}

export async function findUser(id) {
  const q = 'SELECT name, username FROM users WHERE id=$1';
  const values = [id];

  const res = await query(q, values);
  if (res && res.rowCount === 1) {
    return res.rows[0];
  }
  return null;
}
