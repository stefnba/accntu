import { userTableConfig } from '@/features/user/server/db/config';
import { createFeatureSchemas } from '@/lib/schema';
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

export const userSchemas = createFeatureSchemas(userTableConfig)
    // .addCore('updateById', ({ baseSchema, idFieldsSchema }) => {
    //     // we need to define the fieds so better-auth doesn't complain
    //     // when using updateUser
    //     const input = baseSchema
    //         .extend({
    //             name: z.string(),
    //             lastName: z.string(),
    //             image: z.string(),
    //         })
    //         .partial();

    //     return {
    //         service: baseSchema,
    //         query: baseSchema,
    //         form: input,
    //         endpoint: { json: input, param: idFieldsSchema },
    //     };
    // })
    .addSchema('updateSettingsById', ({ schemas }) => {
        const settingsUpdateSchema = z.object({
            settings: userSettingsSchema,
        });
        const input = z.object({ ids: schemas.id, data: settingsUpdateSchema });

        return {
            service: input,
            query: input,
            form: settingsUpdateSchema,
            endpoint: { json: settingsUpdateSchema, param: schemas.id },
        };
    })
    .build();
