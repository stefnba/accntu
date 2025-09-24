import { connectedBankSchemas } from '@/features/bank/schemas/connected-bank';

import { connectedBank } from '@/features/bank/server/db/tables';
import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { and, eq } from 'drizzle-orm';

export const connectedBankQueries = createFeatureQueries
    .registerSchema(connectedBankSchemas)
    .registerCoreQueries(connectedBank, {
        idFields: ['id'],
        userIdField: 'userId',
        defaultIdFilters: {
            isActive: true,
        },
        allowedUpsertColumns: ['globalBankId', 'apiCredentials'],
        queryConfig: {
            getMany: {
                filters: (filters, f) => [f.eq('globalBankId', filters?.globalBankId)],
            },
        },
    })
    /**
     * Get many connected banks
     */
    .overwriteQuery('getMany', {
        fn: async ({ userId, filters }) => {
            return await db.query.connectedBank.findMany({
                where: and(eq(connectedBank.userId, userId), eq(connectedBank.isActive, true)),
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
    .overwriteQuery('getById', {
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
            return result;
        },
    });

export type TConnectedBank = InferFeatureType<typeof connectedBankQueries>;
