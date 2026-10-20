import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export type Database = NodePgDatabase<typeof schema>;

/**
 * Locally DATABASE_URL points at docker-compose Postgres. On AWS it is unset and node-postgres
 * reads the standard PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE/PGSSLMODE variables that ECS
 * injects from Secrets Manager.
 */
export function createPool(connectionString = process.env.DATABASE_URL): Pool {
  return new Pool({ connectionString, max: 10, idleTimeoutMillis: 30_000 });
}

export function createDb(pool: Pool): Database {
  return drizzle({ client: pool, schema, casing: 'snake_case' });
}

// Reuse one pool per process (and across dev hot reloads) so connections are not exhausted.
const globalForDb = globalThis as typeof globalThis & {
  __eastsidePool?: Pool;
  __eastsideDb?: Database;
};

export function getPool(): Pool {
  globalForDb.__eastsidePool ??= createPool();
  return globalForDb.__eastsidePool;
}

export function getDb(): Database {
  globalForDb.__eastsideDb ??= createDb(getPool());
  return globalForDb.__eastsideDb;
}
