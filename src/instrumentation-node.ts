import path from 'node:path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { syncCatalog } from './features/catalog/sync';
import { getDb, getPool } from './server/db/client';

// Arbitrary constant shared by every task, so concurrent boots run these steps one at a time.
const BOOT_LOCK_KEY = 4_247_001;

/**
 * Production boot tasks, enabled per environment by ECS (see infra/lib/eastside-stack.ts):
 * - RUN_MIGRATIONS_ON_BOOT applies pending SQL in ./drizzle before the server takes traffic.
 * - RUN_CATALOG_SYNC_ON_BOOT upserts the code-defined catalog (src/features/catalog/data).
 * A failure exits the process so the ECS deployment circuit breaker rolls back.
 */
export async function runBootTasks(): Promise<void> {
  const runMigrations = process.env.RUN_MIGRATIONS_ON_BOOT === 'true';
  const runCatalogSync = process.env.RUN_CATALOG_SYNC_ON_BOOT === 'true';
  if (!runMigrations && !runCatalogSync) return;

  const lockClient = await getPool().connect();
  try {
    await lockClient.query('select pg_advisory_lock($1)', [BOOT_LOCK_KEY]);
    if (runMigrations) {
      await migrate(getDb(), { migrationsFolder: path.join(process.cwd(), 'drizzle') });
      console.info('[boot] database migrations applied');
    }
    if (runCatalogSync) {
      const result = await syncCatalog(getDb());
      console.info('[boot] catalog synced', result);
    }
  } catch (error) {
    console.error('[boot] startup task failed; exiting so the deployment rolls back', error);
    process.exit(1);
  } finally {
    await lockClient.query('select pg_advisory_unlock($1)', [BOOT_LOCK_KEY]).catch(() => undefined);
    lockClient.release();
  }
}
