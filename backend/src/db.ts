import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'example',
  database: process.env.PGDATABASE || 'licensing_db',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432
});

export default {
  query: (text: any, params: any) => pool.query(text, params),
  pool
}
