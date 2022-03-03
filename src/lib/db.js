import { readFile } from 'fs/promises';
import pg from 'pg';
import xss from 'xss';

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
  const q = 'SELECT id, name, username FROM users WHERE id=$1';
  const values = [id];

  const res = await query(q, values);
  if (res && res.rowCount === 1) {
    return res.rows[0];
  }
  return null;
}

export async function registerUser(name, username, password) {
  const q = `
  INSERT INTO
    users(name, username, password, admin)
  VALUES($1, $2, $3, false)
    RETURNING id, name`;
  const values = [name, username, password];
  const res = await query(q, values);
  if (res && res.rowCount === 1) {
    return res.rows[0];
  }
  return null;
}

export async function register(name, comment, event) {
  let success = true;
  const q = `
  INSERT INTO
    registrations(name, comment, event)
  VALUES
    ($1, $2, $3)`;

  const values = [name, comment, event];
  try {
    await query(q, values);
  } catch (e) {
    console.error('Error inserting signature', e);
    success = false;
  }

  return success;
}

export async function createEvent(id, name, slug, description) {
  let success = true;
  const q = `
  INSERT INTO
    events(userid, name, slug, description)
  VALUES
    ($1, $2, $3, $4)`;
  const values = [id, name, slug, description];
  try {
    await query(q, values);
  } catch (error) {
    console.error(error);
    success = false;
  }
  return success;
}

export async function findEventByName(name) {
  const q = 'SELECT * FROM events WHERE name=$1';
  const values = [name];
  try {
    const result = await query(q, values);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error(e);
    return null;
  }

  return false;
}

export async function removeEvent(id) {
  let success = true;
  const q = 'DELETE FROM events WHERE id=$1';
  const values = [id];
  try {
    await query(q, values);
  } catch (error) {
    console.error(error);
    success = false;
  }
  return success;
}

export async function getRegistrations(id) {
  const q = 'SELECT name FROM registrations WHERE event=$1';
  const values = [id];
  const result = await query(q, values);
  return result.rows;
}

export async function checkRegistration(username, id) {
  const q = 'SELECT * FROM registrations WHERE name=$1 AND event=$2';
  const values = [username, id];
  const result = await query(q, values);
  let success = true;
  if (result && result.rowCount === 1) {
    const q2 = 'DELETE FROM registrations WHERE name=$1 AND event =$2';
    const values2 = [username, id];
    try {
      await query(q2, values2);
    } catch (error) {
      console.error(error);
      success = false;
    }
    return success;
  }
  return null;
}

// kannski færa
function isEmpty(s) {
  return s == null && !s;
}

function validate(title, text) {
  const errors = [];

  if (!isEmpty(title)) {
    if (typeof title !== 'string' || title.length === 0) {
      errors.push({
        field: 'title',
        error: 'Title must be a non-empty string',
      });
    }
  }

  if (!isEmpty(text)) {
    if (typeof text !== 'string' || text.length === 0) {
      errors.push({
        field: 'text',
        error: 'Text must be a non-empty string',
      });
    }
  }

  return errors;
}

export async function update(id, item) {
  const result = await query('SELECT * FROM events where id = $1', [id]);

  if (result.rows.length === 0) {
    return {
      success: false,
      notFound: true,
      validation: [],
    };
  }

  const validationResult = validate(item.name);

  if (validationResult.length > 0) {
    return {
      success: false,
      notFound: false,
      validation: validationResult,
    };
  }

  const changedColumns = [
    !isEmpty(item.name) ? 'title' : null,
    !isEmpty(item.description) ? 'text' : null,
  ].filter(Boolean);

  const changedValues = [
    !isEmpty(item.title) ? xss(item.title) : null,
    !isEmpty(item.description) ? xss(item.description) : null,
  ].filter(Boolean);

  if (
    changedColumns.length === 0 ||
    changedColumns.length !== changedValues.length
  ) {
    return {
      success: false,
      notFound: false,
      validation: [{ field: '', error: 'Ógild gögn' }],
    };
  }

  const updates = [id, ...changedValues];

  const updatedColumnsQuery = changedColumns.map(
    (column, i) => `${column} = $${i + 2}`
  );

  const q = `
    UPDATE events
    SET ${updatedColumnsQuery.join(', ')}
    WHERE id = $1
    RETURNING *`;

  const updateResult = await query(q, updates);

  return {
    success: true,
    item: updateResult.rows[0],
  };
}
