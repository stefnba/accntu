import { updateUserSchema } from '@/server/db';
import { z } from 'zod';

// ====================
// Query Layer
// ====================

export const userQuerySchemas = {
    update: updateUserSchema
        .pick({
            name: true,
            lastName: true,
            image: true,
            settings: true,
        })
        .partial(),
};

export type TUserQuerySchemas = {
    update: z.infer<typeof userQuerySchemas.update>;
};

// ====================
// Service/Endpoint Layer
// ====================

export const userServiceSchemas = {
    update: userQuerySchemas.update,
};

export type TUserServiceSchemas = {
    update: z.infer<typeof userServiceSchemas.update>;
};

// ====================
// Custom Schemas
// ====================
