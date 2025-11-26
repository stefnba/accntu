import { transaction } from '@/features/transaction/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { z } from 'zod';

const numericInputSchema = z.coerce.number();

export const transactionTableConfig = createFeatureTableConfig(transaction)
    .enablePagination()
    .omitBaseSchema(['isHidden', 'isNew'])
    .transformBaseSchema((base) =>
        base.extend({
            userAmount: numericInputSchema,
            accountAmount: numericInputSchema,
            spendingAmount: numericInputSchema,
            balance: numericInputSchema.optional(),
        })
    )
    .enableFiltering({
        search: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        accountIds: z.array(z.string()),
        labelIds: z.array(z.string()),
        type: z.array(z.enum(['transfer', 'credit', 'debit'])),
        currencies: z.array(z.string()),
        tagIds: z.array(z.string()),
    })
    .build();
