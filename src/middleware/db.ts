import { env } from 'cloudflare:workers';
import { createMiddleware } from '@tanstack/react-start';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const dbMiddleware = createMiddleware({ type: 'function' }).server(
  ({ next }) => {
    const sql = postgres(env.DB.connectionString);
    const db = drizzle({ client: sql });
    return next({
      context: {
        db,
      },
    });
  },
);
