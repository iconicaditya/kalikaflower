import postgres from 'postgres';
import { requireDatabaseUrl } from './env';

type SqlClient = ReturnType<typeof postgres>;

declare global {
  // eslint-disable-next-line no-var
  var __gph_sql__: SqlClient | undefined;
}

function getSqlClient(): SqlClient {
  if (!globalThis.__gph_sql__) {
    globalThis.__gph_sql__ = postgres(requireDatabaseUrl(), {
      ssl: 'require',
      max: 5,
      idle_timeout: 20,
      connect_timeout: 15,
    });
  }

  return globalThis.__gph_sql__;
}

export const sql = new Proxy((() => undefined) as unknown as SqlClient, {
  apply(_target, _thisArg, args) {
    return (getSqlClient() as unknown as (...callArgs: unknown[]) => unknown)(...args);
  },
  get(_target, prop) {
    return (getSqlClient() as unknown as Record<PropertyKey, unknown>)[prop];
  },
}) as SqlClient;

