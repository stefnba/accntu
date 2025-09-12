import { connectedBankSchemas } from '@/features/bank/schemas/connected-bank';

import { db } from '@/server/db';
import { connectedBank } from '@/features/bank/server/db/tables';
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
            return (
                (await db.query.connectedBank.findFirst({
                    where: and(eq(connectedBank.id, ids.id), eq(connectedBank.userId, userId)),
                    with: {
                        globalBank: true,
                        connectedBankAccounts: {
                            with: {
                                globalBankAccount: true,
                            },
                        },
                    },
                })) ?? {}
            );
        },
    });

export type TConnectedBank = InferFeatureType<typeof connectedBankQueries>;
