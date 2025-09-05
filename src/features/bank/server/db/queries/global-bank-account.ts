import { globalBankAccountSchemas } from '@/features/bank/schemas/global-bank-account';
import { globalBankAccount } from '@/features/bank/server/db/tables';
import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db/query';
import { and, eq } from 'drizzle-orm';

export const globalBankAccountQueries = createFeatureQueries
    .registerSchema(globalBankAccountSchemas)
    /**
     * Create a global bank account
     */
    .addQuery('create', {
        operation: 'create global bank account',
        fn: async ({ data }) => {
            const [result] = await db.insert(globalBankAccount).values(data).returning();
            return result || null;
        },
    })
    /**
     * Get many global bank accounts
     */
    .addQuery('getMany', {
        operation: 'get global bank accounts with filters',
        fn: async ({ filters, pagination }) => {
            const conditions = [eq(globalBankAccount.isActive, true)];

            if (filters?.globalBankId) {
                conditions.push(eq(globalBankAccount.globalBankId, filters.globalBankId));
            }

            return await db
                .select()
                .from(globalBankAccount)
                .where(and(...conditions));
        },
    })
    /**
     * Get a global bank account by ID
     */
    .addQuery('getById', {
        operation: 'get global bank account by ID',
        fn: async ({ ids }) => {
            const [result] = await db
                .select()
                .from(globalBankAccount)
                .where(eq(globalBankAccount.id, ids.id))
                .limit(1);
            return result || null;
        },
    })
    /**
     * Update a global bank account by ID
     */
    .addQuery('updateById', {
        operation: 'update global bank account',
        fn: async ({ ids, data }) => {
            const [result] = await db
                .update(globalBankAccount)
                .set(data)
                .where(eq(globalBankAccount.id, ids.id))
                .returning();
            return result || null;
        },
    })
    /**
     * Remove a global bank account by ID
     */
    .addQuery('removeById', {
        operation: 'remove global bank account',
        fn: async ({ ids }) => {
            const [result] = await db
                .update(globalBankAccount)
                .set({ isActive: false })
                .where(eq(globalBankAccount.id, ids.id))
                .returning();
            return result || null;
        },
    });

export type TGlobalBankAccount = InferFeatureType<typeof globalBankAccountQueries>;
