import { user } from '@/lib/auth/server/db/tables';
import { createFeatureSchemas } from '@/lib/schemas';
import { z } from 'zod';

export const userSettingsSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.enum(['en']).default('en'),
    timezone: z.string().default('UTC'),
    dateFormat: z.string().default('MM/DD/YYYY'),
    timeFormat: z.string().default('12h'),
});

export type TUserSettings = z.infer<typeof userSettingsSchema>;

export const { schemas: userSchemas } = createFeatureSchemas
    .registerTable(user)
    .pick({ name: true, lastName: true, image: true, settings: true })
    .setIdFields({ id: true })
    .addCore('updateById', ({ baseSchema, idFieldsSchema }) => {
        // we need to define the fieds so better-auth doesn't complain
        // when using updateUser
        const input = baseSchema
            .extend({
                name: z.string(),
                lastName: z.string(),
                image: z.string(),
            })
            .partial();

        return {
            service: baseSchema,
            query: baseSchema,
            form: input,
            endpoint: { json: input, param: idFieldsSchema },
        };
    })
    .addCustom('updateSettingsById', ({ baseSchema, idFieldsSchema }) => {
        const settingsSchema = baseSchema.pick({ settings: true });
        const input = z.object({ ids: idFieldsSchema, data: settingsSchema.partial() });

        return {
            service: input,
            query: input,
            form: settingsSchema,
            endpoint: { json: settingsSchema, param: idFieldsSchema },
        };
    });
