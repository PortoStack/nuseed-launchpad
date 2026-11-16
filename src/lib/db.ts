import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URI ||
  "postgresql://postgres:postgres@localhost:5432/postgres";

/**
 * Global Postgres.js client for Supabase PostgreSQL.
 * Note: `prepare: false` is required when using Supabase's transaction pooler (pgbouncer on port 6543)
 * so serverless functions on Vercel do not fail on duplicate prepared statements.
 */
export const sql = postgres(connectionString, {
  prepare: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});
