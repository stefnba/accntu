import { user, userSetting } from '@db/schema';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const UserPublicSchema = createSelectSchema(user)
    .pick({
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        image: true,
        role: true
    })
    .and(
        z.object({
            settings: createSelectSchema(userSetting).omit({ userId: true })
        })
    );

export type User = z.infer<typeof UserPublicSchema>;
