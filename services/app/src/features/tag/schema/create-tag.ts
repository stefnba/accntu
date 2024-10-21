import { tag } from '@db/schema';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const CreateTagSchema = createInsertSchema(tag).pick({
    userId: true,
    color: true,
    name: true
});

export type TCreateTagValues = z.input<typeof CreateTagSchema>;
