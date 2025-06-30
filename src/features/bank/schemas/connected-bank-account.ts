import {
    insertConnectedBankAccountSchema,
    selectConnectedBankAccountSchema,
    updateConnectedBankAccountSchema,
} from '@/features/bank/server/db/schemas';
import { z } from 'zod';

// ====================
// Query Layer
// ====================

export const connectedBankAccountQuerySchemas = {
    select: selectConnectedBankAccountSchema,
    insert: insertConnectedBankAccountSchema.omit({
        updatedAt: true,
        createdAt: true,
        id: true,
    }),
    update: updateConnectedBankAccountSchema.pick({
        name: true,
        description: true,
        type: true,
        currency: true,
        accountNumber: true,
        iban: true,
        currentBalance: true,
        providerAccountId: true,
        isSharedAccount: true,
        isActive: true,
    }),
};

export type TConnectedBankAccountQuerySchemas = {
    select: z.infer<typeof connectedBankAccountQuerySchemas.select>;
    insert: z.infer<typeof connectedBankAccountQuerySchemas.insert>;
    update: z.infer<typeof connectedBankAccountQuerySchemas.update>;
};

// ====================
// Service/Endpoint Layer
// ====================

export const connectedBankAccountServiceSchemas = {
    create: connectedBankAccountQuerySchemas.insert
        .omit({
            userId: true,
        })
        .partial({
            name: true,
        }),
    update: connectedBankAccountQuerySchemas.update.pick({
        name: true,
        description: true,
    }),
};

export type TConnectedBankAccountServiceSchemas = {
    create: z.infer<typeof connectedBankAccountServiceSchemas.create>;
    update: z.infer<typeof connectedBankAccountServiceSchemas.update>;
};

// ====================
// Custom Schemas
// ====================

export const balanceUpdateSchema = z.object({
    currentBalance: z.string().transform((val) => parseFloat(val)),
    lastSyncAt: z.date().optional(),
});

export type TBalanceUpdate = z.infer<typeof balanceUpdateSchema>;
