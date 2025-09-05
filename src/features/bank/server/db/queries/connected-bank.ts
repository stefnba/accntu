import { connectedBankSchemas } from '@/features/bank/schemas/connected-bank';

import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { and, eq } from 'drizzle-orm';
import { connectedBank } from '../tables';

export const connectedBankQueries = createFeatureQueries
    .registerSchema(connectedBankSchemas)
    /**
     * Get many connected banks
     */
    .addQuery('getMany', {
        operation: 'get all connected banks by user id',
        fn: async ({ userId, filters }) => {
            const whereClause = [
                eq(connectedBank.userId, userId),
                eq(connectedBank.isActive, true),
            ];

            if (filters?.globalBankId) {
                whereClause.push(eq(connectedBank.globalBankId, filters.globalBankId));
            }

            const where = and(...whereClause);

            return await db.query.connectedBank.findMany({
                where,
                with: {
                    globalBank: true,
                    connectedBankAccounts: {
                        with: {
                            globalBankAccount: true,
                        },
                    },
                },
            });
        },
    })
    /**
     * Get a connected bank by id
     */
    .addQuery('getById', {
        operation: 'get connected bank by ID',
        fn: async ({ ids, userId }) => {
            const result = await db.query.connectedBank.findFirst({
                where: and(eq(connectedBank.id, ids.id), eq(connectedBank.userId, userId)),
                with: {
                    globalBank: true,
                    connectedBankAccounts: {
                        with: {
                            globalBankAccount: true,
                        },
                    },
                },
            });
            return result || null;
        },
    })
    /**
     * Create a connected bank
     */
    .addQuery('create', {
        operation: 'create connected bank',
        fn: async ({ data, userId }) => {
            const result = await db
                .insert(connectedBank)
                .values({ ...data, userId })
                .onConflictDoNothing()
                .returning();
            return result[0];
        },
    })
    /**
     * Update a connected bank by id
     */
    .addQuery('updateById', {
        operation: 'update connected bank',
        fn: async ({ ids, data, userId }) => {
            const result = await db
                .update(connectedBank)
                .set(data)
                .where(and(eq(connectedBank.id, ids.id), eq(connectedBank.userId, userId)))
                .returning();
            return result[0];
        },
    })
    /**
     * Remove a connected bank by id
     */
    .addQuery('removeById', {
        operation: 'remove connected bank',
        fn: async ({ ids, userId }) => {
            return await db
                .delete(connectedBank)
                .where(and(eq(connectedBank.id, ids.id), eq(connectedBank.userId, userId)));
        },
    });

export type TConnectedBank = InferFeatureType<typeof connectedBankQueries>;
