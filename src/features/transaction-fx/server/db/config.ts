import { transactionFxRate } from '@/features/transaction-fx/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import z from 'zod';

export const transactionFxRateTableConfig = createFeatureTableConfig(transactionFxRate)
    .restrictInsertFields(['baseCurrency', 'targetCurrency', 'exchangeRate', 'date'])
    .restrictUpdateFields(['exchangeRate', 'date'])
    .restrictReturnColumns([
        'id',
        'baseCurrency',
        'targetCurrency',
        'exchangeRate',
        'date',
        'createdAt',
        'updatedAt',
    ])
    .setIds(['id'])
    .enablePagination()
    .enableFiltering({
        baseCurrency: z.string(),
        targetCurrency: z.string(),
        date: z.date(),
    })
    .build();
