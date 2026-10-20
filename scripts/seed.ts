// Loads the code-defined catalog into the local database: `npm run db:seed`.
import { loadEnvConfig } from '@next/env';
import { syncCatalog } from '../src/features/catalog/sync';
import { createDb, createPool } from '../src/server/db/client';

async function main() {
  loadEnvConfig(process.cwd(), true);
  const pool = createPool();
  try {
    const result = await syncCatalog(createDb(pool));
    console.log('Catalog synced:', result);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
