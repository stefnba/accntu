import {
    insertGlobalBankAccountSchema,
    selectGlobalBankAccountSchema,
    updateGlobalBankAccountSchema,
} from '@/features/bank/server/db/schemas';
import { z } from 'zod';

// ====================
// Query Layer
// ====================

export const globalBankAccountQuerySchemas = {
    select: selectGlobalBankAccountSchema,
    insert: insertGlobalBankAccountSchema.pick({
        globalBankId: true,
        type: true,
        name: true,
        description: true,
        transformQuery: true,
        transformConfig: true,
        sampleTransformData: true,
        isActive: true,
    }),
    update: updateGlobalBankAccountSchema.pick({
        type: true,
        name: true,
        description: true,
        transformQuery: true,
        transformConfig: true,
        sampleTransformData: true,
        isActive: true,
    }),
};

export type TGlobalBankAccountQuerySchemas = {
    select: z.infer<typeof globalBankAccountQuerySchemas.select>;
    insert: z.infer<typeof globalBankAccountQuerySchemas.insert>;
    update: z.infer<typeof globalBankAccountQuerySchemas.update>;
};

// ====================
// Service/Endpoint Layer
// ====================

export const globalBankAccountServiceSchemas = {
    insert: globalBankAccountQuerySchemas.insert,
    update: globalBankAccountQuerySchemas.update.partial(),
};

export type TGlobalBankAccountServiceSchemas = {
    insert: z.infer<typeof globalBankAccountServiceSchemas.insert>;
    update: z.infer<typeof globalBankAccountServiceSchemas.update>;
};

// ====================
// Custom Schemas
// ====================

export const csvConfigSchema = z.object({
    delimiter: z.string().optional(),
    hasHeader: z.boolean().optional(),
    encoding: z.string().optional(),
    skipRows: z.number().optional(),
    dateFormat: z.string().optional(),
    decimalSeparator: z.enum(['.', ',']).optional(),
    thousandsSeparator: z.enum([',', '.', ' ', '']).optional(),
    quoteChar: z.string().optional(),
    escapeChar: z.string().optional(),
    nullValues: z.array(z.string()).optional(),
});

export type TCsvConfig = z.infer<typeof csvConfigSchema>;
