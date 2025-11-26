import { connectedBankAccountSchemas } from '@/features/bank/schemas/connected-bank-account';
import { connectedBankAccountTableConfig } from '@/features/bank/server/db/config';
import { connectedBank, connectedBankAccount } from '@/features/bank/server/db/tables';
import { db } from '@/server/db';

import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { and, eq } from 'drizzle-orm';

export const connectedBankAccountQueries = createFeatureQueries(
    'connected-bank-account',
    connectedBankAccountTableConfig
)
    .registerSchema(connectedBankAccountSchemas)
    .registerAllStandard({
        defaultFilters: {
            isActive: true,
        },
        getMany: {
            filters: (filters, f) => [
                f.eq('connectedBankId', filters?.connectedBankId),
                f.eq('type', filters?.type),
            ],
        },
    })
    /**
     * Get many connected bank accounts
     */
    .addQuery('getMany', {
        operation: 'get all connected bank accounts by user id',
        fn: async ({ userId, filters }) => {
            const whereClause = [
                eq(connectedBankAccount.userId, userId),
                eq(connectedBankAccount.isActive, true),
            ];
            if (filters?.connectedBankId) {
                whereClause.push(eq(connectedBankAccount.connectedBankId, filters.connectedBankId));
            }

            const result = await db
                .select()
                .from(connectedBankAccount)
                .innerJoin(
                    connectedBank,
                    eq(connectedBankAccount.connectedBankId, connectedBank.id)
                )
                .where(and(...whereClause));

            return result;
        },
    })
    .build();

export type TConnectedBankAccount = InferFeatureType<typeof connectedBankAccountQueries>;
