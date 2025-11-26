import {
    transactionBudget,
    transactionBudgetToParticipant,
} from '@/features/budget/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import z from 'zod';

export const transactionBudgetTableConfig = createFeatureTableConfig(transactionBudget)
    .enablePagination()
    .enableFiltering({
        transactionId: z.string(),
        splitSource: z.enum(['transaction', 'bucket', 'account', 'none']),
    })
    .enableOrdering(['createdAt'])
    .build();

export const transactionBudgetToParticipantTableConfig = createFeatureTableConfig(
    transactionBudgetToParticipant
)
    .setIds(['transactionBudgetId'])
    .build();
