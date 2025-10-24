import { globalBankSchemas } from '@/features/bank/schemas/global-bank';
import { bankQueries } from '@/features/bank/server/db/queries';
import { createFeatureServices } from '@/server/lib/service';

export const globalBankServices = createFeatureServices('globalBank')
    .registerSchemas(globalBankSchemas)
    .registerQueries(bankQueries.globalBank)
    .registerCoreServices()
    .build();
