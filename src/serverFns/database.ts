import { createServerFn } from '@tanstack/react-start';
import { dbMiddleware } from '../middleware/db';

export const createDatabaseFunction = createServerFn().middleware([
  dbMiddleware,
]);
