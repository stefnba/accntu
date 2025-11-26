import { globalBankSchemas } from '@/features/bank/schemas/global-bank';
import { globalBankTableConfig } from '@/features/bank/server/db/config';

import { createFeatureQueries, InferFeatureType } from '@/server/lib/db/query';

export const globalBankQueries = createFeatureQueries('global-bank', globalBankTableConfig)
    .registerSchema(globalBankSchemas)
    .registerAllStandard({
        getMany: {
            filters: (filters, f) => [
                f.ilike('name', filters?.search),
                f.eq('country', filters?.country),
            ],
        },
    })
    .build();

export type TGlobalBank = InferFeatureType<typeof globalBankQueries>;
