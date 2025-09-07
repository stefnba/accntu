import { connectedBankAccountSchemas } from '@/features/bank/schemas/connected-bank-account';
import { db, dbTable } from '@/server/db';

import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { and, eq } from 'drizzle-orm';

export const connectedBankAccountQueries = createFeatureQueries
    .registerSchema(connectedBankAccountSchemas)
    /**
     * Get many connected bank accounts
     */
    .addQuery('getMany', {
        operation: 'get all connected bank accounts by user id',
        fn: async ({ userId, filters }) => {
            const whereClause = [
                eq(dbTable.connectedBankAccount.userId, userId),
                eq(dbTable.connectedBankAccount.isActive, true),
            ];
            if (filters?.connectedBankId) {
                whereClause.push(
                    eq(dbTable.connectedBankAccount.connectedBankId, filters.connectedBankId)
                );
            }

            const result = await db
                .select()
                .from(dbTable.connectedBankAccount)
                .innerJoin(
                    dbTable.connectedBank,
                    eq(dbTable.connectedBankAccount.connectedBankId, dbTable.connectedBank.id)
                )
                .where(and(...whereClause));

            return result;
        },
    })
    /**
     * Create a connected bank account
     */
    .addQuery('create', {
        operation: 'create connected bank account',
        fn: async ({ data, userId }) => {
            const result = await db
                .insert(dbTable.connectedBankAccount)
                .values({ ...data, userId })
                .returning();
            return result[0];
        },
    })
    /**
     * Get a connected bank account by id
     */
    .addQuery('getById', {
        operation: 'get connected bank account by id',
        fn: async ({ ids, userId }) => {
            const result = await db
                .select()
                .from(dbTable.connectedBankAccount)
                .where(
                    and(
                        eq(dbTable.connectedBankAccount.id, ids.id),
                        eq(dbTable.connectedBankAccount.userId, userId)
                    )
                );
            return result[0] || null;
        },
    })
    /**
     * Update a connected bank account by id
     */
    .addQuery('updateById', {
        operation: 'update connected bank account by id',
        fn: async ({ ids, data, userId }) => {
            const result = await db
                .update(dbTable.connectedBankAccount)
                .set(data)
                .where(
                    and(
                        eq(dbTable.connectedBankAccount.id, ids.id),
                        eq(dbTable.connectedBankAccount.userId, userId)
                    )
                );
            return result[0];
        },
    })
    /**
     * Remove a connected bank account by id
     */
    .addQuery('removeById', {
        operation: 'remove connected bank account by id',
        fn: async ({ ids, userId }) => {
            const result = await db
                .delete(dbTable.connectedBankAccount)
                .where(
                    and(
                        eq(dbTable.connectedBankAccount.id, ids.id),
                        eq(dbTable.connectedBankAccount.userId, userId)
                    )
                );
            return result[0];
        },
    });

export type TConnectedBankAccount = InferFeatureType<typeof connectedBankAccountQueries>;
