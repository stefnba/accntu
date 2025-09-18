import { globalBankAccountSchemas } from '@/features/bank/schemas/global-bank-account';

import { globalBankAccount } from '@/features/bank/server/db/tables';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db/query';

export const globalBankAccountQueries = createFeatureQueries
    .registerSchema(globalBankAccountSchemas)
    .registerCoreQueries(globalBankAccount, {
        idFields: ['id'],
        defaultIdFilters: {
            isActive: true,
        },
        allowedUpsertColumns: [
            'globalBankId',
            'type',
            'name',
            'description',
            'transformQuery',
            'transformConfig',
            'sampleTransformData',
        ],
        queryConfig: {
            getMany: {
                filters(filterParams, filterClauses) {
                    return [
                        filterClauses.eq('globalBankId', filterParams?.globalBankId),
                        filterClauses.eq('type', filterParams?.type),
                    ];
                },
            },
        },
    });

export type TGlobalBankAccount = InferFeatureType<typeof globalBankAccountQueries>;
