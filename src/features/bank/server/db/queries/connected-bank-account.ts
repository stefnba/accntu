import { connectedBankAccountSchemas } from '@/features/bank/schemas/connected-bank-account';
import { db, dbTable } from '@/server/db';

import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { and, eq } from 'drizzle-orm';

export const connectedBankAccountQueries = createFeatureQueries
    .registerSchema(connectedBankAccountSchemas)
    .registerCoreQueries(dbTable.connectedBankAccount, {
        idFields: ['id'],
        userIdField: 'userId',
        defaultIdFilters: {
            isActive: true,
        },
    })
    /**
     * Get many connected bank accounts
     */
    .overwriteQuery('getMany', {
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
    });

export type TConnectedBankAccount = InferFeatureType<typeof connectedBankAccountQueries>;
