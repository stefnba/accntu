import { userSchemas } from '@/features/user/schemas';
import { user } from '@/lib/auth/server/db/tables';
import { db } from '@/server/db';
import { createFeatureQueries } from '@/server/lib/db';
import { and, eq } from 'drizzle-orm';

export const userQueries = createFeatureQueries('user')
    .registerSchema(userSchemas)
    /**
     * Update user settings by ID
     */
    .addQuery('updateSettingsById', {
        operation: 'update user settings by ID',
        fn: async ({ data, ids }) => {
            return await db
                .update(user)
                .set(data)
                .where(and(eq(user.id, ids.id)));
        },
    });
