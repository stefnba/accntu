import { transactionFxRateTableConfig } from '@/features/transaction-fx/server/db/config';
import { createFeatureSchemas } from '@/lib/schema';
import { z } from 'zod';

export const transactionFxSchemas = createFeatureSchemas(transactionFxRateTableConfig)
    .registerAllStandard()
    .build();

export const BatchExchangeRatesSchema = z.object({
    rates: z.array(transactionFxSchemas.getMany.service),
});
