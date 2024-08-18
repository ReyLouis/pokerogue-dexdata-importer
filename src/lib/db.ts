// src/lib/db.ts
import { Pool } from 'pg';

let globalPool: Pool;

export function getDb() {
  if (!globalPool) {
    const connectionString = process.env.POSTGRES_PRISMA_URL;
    globalPool = new Pool({
      connectionString,
    });
  }

  return globalPool;
}
