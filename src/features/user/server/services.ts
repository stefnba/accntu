import { userSchemas, userSettingsSchema } from '@/features/user/schemas';
import { userQueries } from '@/features/user/server/db/queries';
import { db } from '@/server/db';
import { user } from '@/server/db/tables';
import { AppErrors } from '@/server/lib/error';
import { createFeatureServices } from '@/server/lib/service';
import { eq } from 'drizzle-orm';

export const userServices = createFeatureServices('user')
    .registerSchemas(userSchemas)
    .registerQueries(userQueries)
    .addService('updateSettingsById', ({ queries }) => ({
        operation: 'update user settings by id',
        throwOnNull: true,
        fn: async ({ data, ids }) => {
            if (!data.settings) {
                throw AppErrors.validation('INVALID_INPUT', {
                    layer: 'service',
                    message: 'Settings are required for updateSettingsById',
                    details: { ids, data },
                });
            }

            const [existingUser] = await db.select().from(user).where(eq(user.id, ids.id)).limit(1);

            if (!existingUser) {
                throw AppErrors.resource('NOT_FOUND', {
                    layer: 'service',
                    message: 'User not found',
                    details: { ids, resource: 'user' },
                });
            }

            const mergedSettings = {
                ...(existingUser.settings || {}),
                ...data.settings,
            };

            const validatedSettings = userSettingsSchema.parse(mergedSettings);

            return await queries.updateSettingsById({
                ids,
                data: { settings: validatedSettings },
            });
        },
    }))
    .build();
