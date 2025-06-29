import {
    insertConnectedBankSchema,
    selectConnectedBankSchema,
    updateConnectedBankSchema,
} from '@/features/bank/server/db/schemas';
import { z } from 'zod';

// ====================
// Query Layer
// ====================

export const connectedBankQuerySchemas = {
    select: selectConnectedBankSchema,
    insert: insertConnectedBankSchema.pick({
        userId: true,
        globalBankId: true,
        apiCredentials: true,
        isActive: true,
    }),
    update: updateConnectedBankSchema.pick({
        apiCredentials: true,
        isActive: true,
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
};

export type TConnectedBankServiceSchemas = {
    create: z.infer<typeof connectedBankServiceSchemas.create>;
    update: z.infer<typeof connectedBankServiceSchemas.update>;
};

// ====================
// Custom Schemas
// ====================

export const apiCredentialsSchema = z.object({
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    apiKey: z.string().optional(),
    institutionId: z.string().optional(),
    expiresAt: z.date().optional(),
});

export type TApiCredentials = z.infer<typeof apiCredentialsSchema>;

export const createConnectedBankWithAccountsSchema = connectedBankServiceSchemas.create.extend({
    connectedBankAccounts: z.array(
        z.object({
            globalBankAccountId: z.string(),
        })
    ),
});

export type TCreateConnectedBankWithAccounts = z.infer<typeof createConnectedBankWithAccountsSchema>;