import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pool } from './db.js';

const here = dirname(fileURLToPath(import.meta.url));
try {
  const schema = await readFile(join(here, '..', 'schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('Schéma PostgreSQL vérifié et appliqué.');
  const migration = await readFile(join(here, '..', 'migrations', '001_ai_notes.sql'), 'utf8');
  await pool.query(migration);
  console.log('Migration IA appliquée.');
} catch (error) {
  console.error('Échec de la migration PostgreSQL :', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
