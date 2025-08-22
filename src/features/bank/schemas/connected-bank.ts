import {
    insertConnectedBankSchema,
    selectConnectedBankSchema,
    updateConnectedBankSchema,
} from '@/features/bank/server/db/schemas';
import { z } from 'zod';

/**
 * API credentials schema for connected bank, required to add validation since drizzle-zod does not support json
 */
const apiCredentialsSchema = z
    .object({
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
        apiKey: z.string().optional(),
        institutionId: z.string().optional(),
        expiresAt: z.date().optional(),
    })
    .optional();
export type TApiCredentials = z.infer<typeof apiCredentialsSchema>;

// ====================
// Query Layer
// ====================

export const connectedBankQuerySchemas = {
    select: selectConnectedBankSchema,
    insert: insertConnectedBankSchema
        .pick({
            userId: true,
            globalBankId: true,
            isActive: true,
        })
        .extend({
            apiCredentials: apiCredentialsSchema,
        }),
    update: updateConnectedBankSchema
        .pick({
            isActive: true,
        })
        .extend({
            apiCredentials: apiCredentialsSchema,
        }),
};

export type TConnectedBankQuerySchemas = {
    select: z.infer<typeof connectedBankQuerySchemas.select>;
    insert: z.infer<typeof connectedBankQuerySchemas.insert>;
    update: z.infer<typeof connectedBankQuerySchemas.update>;
};

// ====================
// Service/Endpoint Layer
// ====================

export const connectedBankServiceSchemas = {
    create: connectedBankQuerySchemas.insert.omit({ userId: true }),
    update: connectedBankQuerySchemas.update.partial(),
    select: connectedBankQuerySchemas.select,
};

export type TConnectedBankServiceSchemas = {
    create: z.infer<typeof connectedBankServiceSchemas.create>;
    update: z.infer<typeof connectedBankServiceSchemas.update>;
    select: z.infer<typeof connectedBankServiceSchemas.select>;
};

// ====================
// Custom Schemas
// ====================

export const createConnectedBankWithAccountsSchema = connectedBankServiceSchemas.create.extend({
    connectedBankAccounts: z.array(
        z.object({
            globalBankAccountId: z.string(),
        })
    ),
});

export type TCreateConnectedBankWithAccounts = z.infer<
    typeof createConnectedBankWithAccountsSchema
>;
