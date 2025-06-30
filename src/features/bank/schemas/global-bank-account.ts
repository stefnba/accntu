import {
    insertGlobalBankAccountSchema,
    selectGlobalBankAccountSchema,
    updateGlobalBankAccountSchema,
} from '@/features/bank/server/db/schemas';
import { z } from 'zod';

/**
 * Transform config schema for global bank account, required to add validation since drizzle-zod does not support json
 */
export const transformConfigSchema = z
    .object({
        type: z.enum(['csv', 'excel', 'json']),
        delimiter: z.string().optional(),
        hasHeader: z.boolean().optional(),
        encoding: z.string().optional(),
        skipRows: z.number().optional(),
        idColumns: z
            .union([z.string(), z.array(z.string())])
            .optional()
            .transform((val) => (Array.isArray(val) ? val : val?.split(',').map((v) => v.trim()))),
        dateFormat: z.string().optional(),
        sheetName: z.string().optional(),
        decimalSeparator: z.enum(['.', ',']).optional(),
        thousandsSeparator: z.enum([',', '.', ' ', '']).optional(),
        quoteChar: z.string().optional(),
        escapeChar: z.string().optional(),
        nullValues: z.array(z.string()).optional(),
    })
    .optional()
    .nullable();
export type TTransformConfig = z.infer<typeof transformConfigSchema>;

// ====================
// Query Layer
// ====================

export const globalBankAccountQuerySchemas = {
    select: selectGlobalBankAccountSchema,
    insert: insertGlobalBankAccountSchema
        .pick({
            globalBankId: true,
            type: true,
            name: true,
            description: true,
            transformQuery: true,

            sampleTransformData: true,
            isActive: true,
        })
        .extend({
            transformConfig: transformConfigSchema,
        }),
    update: updateGlobalBankAccountSchema
        .pick({
            type: true,
            name: true,
            description: true,
            transformQuery: true,
            sampleTransformData: true,
            isActive: true,
        })
        .extend({
            transformConfig: transformConfigSchema,
        })
        .partial(),
};

export type TGlobalBankAccountQuery = {
    select: Omit<z.infer<typeof globalBankAccountQuerySchemas.select>, 'transformConfig'> & {
        transformConfig: TTransformConfig;
    };
    insert: z.infer<typeof globalBankAccountQuerySchemas.insert>;
    update: z.infer<typeof globalBankAccountQuerySchemas.update>;
};

// ====================
// Service/Endpoint Layer
// ====================

export const globalBankAccountServiceSchemas = {
    insert: globalBankAccountQuerySchemas.insert,
    update: globalBankAccountQuerySchemas.update,
};

export type TGlobalBankAccountService = {
    insert: z.infer<typeof globalBankAccountServiceSchemas.insert>;
    update: z.infer<typeof globalBankAccountServiceSchemas.update>;
};

// ====================
// Custom Schemas
// ====================

export const testTransformSchema = z
    .object({
        transformQuery: z.string(),
        sampleTransformData: z.string(),
        transformConfig: transformConfigSchema.unwrap(),
    })
    .required();
export type TTestTransformQuery = z.infer<typeof testTransformSchema>;
