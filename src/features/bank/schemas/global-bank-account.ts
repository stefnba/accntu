import { globalBankAccountTableConfig } from '@/features/bank/server/db/config';
import { transformConfigSchema } from '@/features/bank/schemas/common';
import { createFeatureSchemas } from '@/lib/schema';
import { z } from 'zod';

export type TTransformConfig = z.infer<typeof transformConfigSchema>;

export const globalBankAccountSchemas = createFeatureSchemas(globalBankAccountTableConfig)
    .registerAllStandard()
    /**
     * Test a global bank account transformation query
     */
    .addSchema('testTransform', ({ schemas }) => {
        const schema = z.object({
            globalBankAccountId: z.string(),
        });

        return {
            service: schema,
            query: schema,
            endpoint: {
                param: schema,
            },
        };
    })
    .build();

export type { TGlobalBankAccount } from '@/features/bank/server/db/queries/global-bank-account';
