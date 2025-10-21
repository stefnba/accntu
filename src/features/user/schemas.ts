import { user } from '@/lib/auth/server/db/tables';
import { createFeatureSchemas } from '@/lib/schemas';
import { z } from 'zod';

// export const LANGUAGE_OPTIONS = ['en', 'de'] as const;
export const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'German' },
] as const;

export const userSettingsSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.enum(LANGUAGE_OPTIONS.map((option) => option.value)).default('en'),
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
    .addCustom('updateSettingsById', ({ idFieldsSchema }) => {
        const settingsUpdateSchema = z.object({
            settings: userSettingsSchema,
        });
        const input = z.object({ ids: idFieldsSchema, data: settingsUpdateSchema });

        return {
            service: input,
            query: input,
            form: settingsUpdateSchema,
            endpoint: { json: settingsUpdateSchema, param: idFieldsSchema },
        };
    });
