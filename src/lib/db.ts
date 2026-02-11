import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const db = () => {
  const sql = postgres(env.DB.connectionString);
  return drizzle({ client: sql });
};
