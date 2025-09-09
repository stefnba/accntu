import { globalBankSchemas } from '@/features/bank/schemas/global-bank';
import { dbTable } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db/query';

export const globalBankQueries = createFeatureQueries
    .registerSchema(globalBankSchemas)
    .registerCoreQueries(dbTable.globalBank, {
        idFields: ['id'],
        defaultIdFilters: {
            isActive: true,
        },
        allowedUpsertColumns: [
            'bic',
            'color',
            'country',
            'currency',
            'integrationTypes',
            'logo',
            'name',
            'providerSource',
            'providerId',
        ],
        queryConfig: {
            getMany: {
                filters: (filters, f) => [
                    f.ilike('name', filters?.query),
                    f.eq('country', filters?.country),
                ],
            },
        },
    });

export type TGlobalBank = InferFeatureType<typeof globalBankQueries>;
