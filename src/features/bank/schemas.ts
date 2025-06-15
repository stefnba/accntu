import {
    connectedBank,
    connectedBankAccount,
    globalBank,
    globalBankAccount,
} from '@/features/bank/server/db/schemas';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import z from 'zod';

// ====================
// Database schemas
// ====================

// Global bank
export const selectGlobalBankSchema = createSelectSchema(globalBank);
export type TGlobalBank = z.infer<typeof selectGlobalBankSchema>;

// Global bank account
export const selectGlobalBankAccountSchema = createSelectSchema(globalBankAccount);
export type TGlobalBankAccount = z.infer<typeof selectGlobalBankAccountSchema>;

// Connected bank
export const selectConnectedBankSchema = createSelectSchema(connectedBank);
export type TConnectedBank = z.infer<typeof selectConnectedBankSchema>;

/**
 * Insert connected bank schema.
 * Omits apiCredentials and extends it with the apiCredentials schema.
 */
export const insertConnectedBankSchema = createInsertSchema(connectedBank)
    .omit({
        apiCredentials: true,
    })
    .extend({
        apiCredentials: z
            .object({
                accessToken: z.string().optional(),
                refreshToken: z.string().optional(),
                apiKey: z.string().optional(),
                institutionId: z.string().optional(),
                expiresAt: z.date().optional(),
            })
            .optional(),
    });

export type TInsertConnectedBank = z.infer<typeof insertConnectedBankSchema>;

export const updateConnectedBankSchema = createUpdateSchema(connectedBank);
export type TUpdateConnectedBank = z.infer<typeof updateConnectedBankSchema>;

// Connected bank account
export const selectConnectedBankAccountSchema = createSelectSchema(connectedBankAccount);
export type TConnectedBankAccount = z.infer<typeof selectConnectedBankAccountSchema>;

export const insertConnectedBankAccountSchema = createInsertSchema(connectedBankAccount);
export type TInsertConnectedBankAccount = z.infer<typeof insertConnectedBankAccountSchema>;

export const updateConnectedBankAccountSchema = createUpdateSchema(connectedBankAccount).pick({
    description: true,
    name: true,
});
export type TUpdateConnectedBankAccount = z.infer<typeof updateConnectedBankAccountSchema>;

// ====================
// Custom schemas
// ====================

export const searchGlobalBanksSchema = z
    .object({
        query: z.string().optional(),
        country: z.string().length(2).optional(),
    })
    .optional();

/**
 * One-step creation of a connected bank together with the related bank accounts.
 */
export const createConnectedBankSchema = insertConnectedBankSchema
    .pick({
        globalBankId: true,
    })
    .extend({
        connectedBankAccounts: z.array(
            insertConnectedBankAccountSchema.pick({
                globalBankAccountId: true,
            })
        ),
    });
/**
 * One-step creation of a connected bank together with the related bank accounts.
 */
export type TCreateConnectedBank = z.infer<typeof createConnectedBankSchema>;
