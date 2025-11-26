import { connectedBankSchemas } from '@/features/bank/schemas/connected-bank';
import { connectedBankTableConfig } from '@/features/bank/server/db/config';

import { connectedBank } from '@/features/bank/server/db/tables';
import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { and, eq } from 'drizzle-orm';

export const connectedBankQueries = createFeatureQueries('connected-bank', connectedBankTableConfig)
    .registerSchema(connectedBankSchemas)

    .registerAllStandard({
        getMany: {
            defaultFilters: {
                isActive: true,
            },
            filters: (filters, f) => [f.eq('globalBankId', filters?.globalBankId)],
        },
    })

    /**
     * Get many connected banks
     */
    .addQuery('getMany', {
        fn: async ({ userId }) => {
            const result = await db.query.connectedBank.findMany({
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
            return result;
        },
    })
    /**
     * Get a connected bank by id
     */
    .addQuery('getById', {
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
    })
    .build();

export type TConnectedBank = InferFeatureType<typeof connectedBankQueries>;
