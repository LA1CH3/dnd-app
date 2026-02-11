import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { db } from './db';
import { username } from 'better-auth/plugins/username';
import * as schema from '../db/schema';

export const auth = () =>
  betterAuth({
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },
    database: drizzleAdapter(db(), {
      provider: 'pg',
      schema,
    }),
    plugins: [
      username({
        minUsernameLength: 6,
        maxUsernameLength: 6,
        usernameNormalization: (u) => u.toUpperCase(),
        validationOrder: { username: 'post-normalization' },
        usernameValidator: (u) =>
          /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/.test(u),
      }),
      tanstackStartCookies(),
    ],
  });
