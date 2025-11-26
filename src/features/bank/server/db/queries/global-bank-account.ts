import { globalBankAccountSchemas } from '@/features/bank/schemas/global-bank-account';
import { globalBankAccountTableConfig } from '@/features/bank/server/db/config';

import { createFeatureQueries, InferFeatureType } from '@/server/lib/db/query';

export const globalBankAccountQueries = createFeatureQueries(
    'global-bank-account',
    globalBankAccountTableConfig
)
    .registerSchema(globalBankAccountSchemas)
    .registerAllStandard({
        getMany: {
            filters: (filters, f) => [
                f.eq('globalBankId', filters?.globalBankId),
                f.eq('type', filters?.type),
            ],
        },
    })
    .build();

export type TGlobalBankAccount = InferFeatureType<typeof globalBankAccountQueries>;
