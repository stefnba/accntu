import { tag } from '@db/schema';
import { createId } from '@paralleldrive/cuid2';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// export const CreateTagSchema = z.object({
//     color: z.string().optional(),
//     name: z.string().trim().min(1).max(255)
// });

export const CreateTagSchema = createInsertSchema(tag).pick({
    userId: true,
    color: true,
    name: true
});

export type TCreateTagValues = z.input<typeof CreateTagSchema>;
