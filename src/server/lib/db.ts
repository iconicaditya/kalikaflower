import postgres from 'postgres';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var __gph_sql__: ReturnType<typeof postgres> | undefined;
}

export const sql = globalThis.__gph_sql__ ?? postgres(env.DATABASE_URL, {
  ssl: 'require',
  max: 5,
  idle_timeout: 20,
  connect_timeout: 15,
});

if (!globalThis.__gph_sql__) {
  globalThis.__gph_sql__ = sql;
}

