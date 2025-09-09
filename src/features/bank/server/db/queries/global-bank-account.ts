import { globalBankAccountSchemas } from '@/features/bank/schemas/global-bank-account';

import { dbTable } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db/query';

export const globalBankAccountQueries = createFeatureQueries
    .registerSchema(globalBankAccountSchemas)
    .registerCoreQueries(dbTable.globalBankAccount, {
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
    });

export type TGlobalBankAccount = InferFeatureType<typeof globalBankAccountQueries>;
