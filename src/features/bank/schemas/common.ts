import { z } from 'zod';

export const apiCredentialsSchema = z
    .object({
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
        apiKey: z.string().optional(),
        institutionId: z.string().optional(),
        expiresAt: z.date().optional(),
    })
    .optional();

export const transformConfigSchema = z.object({
    type: z.enum(['csv', 'excel', 'json']),
    delimiter: z.string().optional(),
    hasHeader: z.boolean().optional(),
    encoding: z.string().optional(),
    skipRows: z.coerce.number().optional(),
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
});

