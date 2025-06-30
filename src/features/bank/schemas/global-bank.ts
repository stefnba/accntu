import {
    insertGlobalBankSchema,
    selectGlobalBankSchema,
    updateGlobalBankSchema,
} from '@/features/bank/server/db/schemas';
import { z } from 'zod';

// ====================
// Query Layer
// ====================

export const globalBankQuerySchemas = {
    select: selectGlobalBankSchema,
    insert: insertGlobalBankSchema.omit({
        createdAt: true,
        updatedAt: true,
        id: true,
    }),
    update: updateGlobalBankSchema.omit({
        createdAt: true,
        updatedAt: true,
        id: true,
    }),
};

export type TGlobalBankQuerySchemas = {
    select: z.infer<typeof globalBankQuerySchemas.select>;
    insert: z.infer<typeof globalBankQuerySchemas.insert>;
    update: z.infer<typeof globalBankQuerySchemas.update>;
};

// ====================
// Service/Endpoint Layer
// ====================

export const globalBankServiceSchemas = {
    insert: globalBankQuerySchemas.insert,
    update: globalBankQuerySchemas.update.partial(),
};

export type TGlobalBankServiceSchemas = {
    insert: z.infer<typeof globalBankServiceSchemas.insert>;
    update: z.infer<typeof globalBankServiceSchemas.update>;
};

// ====================
// Custom Schemas
// ====================

export const searchGlobalBanksSchema = z
    .object({
        query: z.string().optional(),
        country: z.string().length(2).optional(),
    })
    .optional();

export type TSearchGlobalBanks = z.infer<typeof searchGlobalBanksSchema>;
