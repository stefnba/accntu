import { user } from '@/lib/auth/server/db/tables';
import { createFeatureSchemas } from '@/lib/schemas';
import { z } from 'zod';

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
            endpoint: { json: input, param: idFieldsSchema },
        };
    });

// ====================
// Legacy Support
// ====================
export const userServiceSchemas = {
    update: userSchemas.updateById.endpoint.json,
};
