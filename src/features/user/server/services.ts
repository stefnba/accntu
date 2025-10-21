import { userSchemas, userSettingsSchema } from '@/features/user/schemas';
import { userQueries } from '@/features/user/server/db/queries';
import { user } from '@/lib/auth/server/db/tables';
import { db } from '@/server/db';
import { AppErrors } from '@/server/lib/error';
import { createFeatureServices } from '@/server/lib/service';
import { eq } from 'drizzle-orm';

export const userServices = createFeatureServices
    .registerSchema(userSchemas)
    .registerQuery(userQueries)
    .defineServices(({ queries }) => ({
        /**
         * Update user settings by ID
         * Merges partial settings with existing settings before saving
         */
        updateSettingsById: async ({ ids, data }) => {
            if (data.settings) {
                const [existingUser] = await db
                    .select({ settings: user.settings })
                    .from(user)
                    .where(eq(user.id, ids.id))
                    .limit(1);

                if (!existingUser) {
                    throw AppErrors.resource('NOT_FOUND', {
                        layer: 'service',
                        message: 'User not found',
                        details: { ids, resource: 'user' },
                    });
                }

                const mergedSettings = {
                    ...existingUser.settings,
                    ...data.settings,
                };

                const validatedSettings = userSettingsSchema.parse(mergedSettings);

                return await queries.updateSettingsById({
                    ids,
                    data: { settings: validatedSettings },
                });
            }

            return await queries.updateSettingsById({ ids, data });
        },
    }));
