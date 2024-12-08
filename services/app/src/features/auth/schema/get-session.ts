import { session } from '@db/schema';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const SessionSelectSchema = createSelectSchema(session);

export type Session = z.infer<typeof SessionSelectSchema>;
