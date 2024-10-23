import { tag } from '@db/schema';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const CreateTagSchema = createInsertSchema(tag, {
    name: z.string().min(1).max(255)
}).pick({
    color: true,
    name: true,
    description: true
});

export type TCreateTagValues = z.input<typeof CreateTagSchema>;
