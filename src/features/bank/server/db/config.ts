import { apiCredentialsSchema } from '@/features/bank/schemas';
import { transformConfigSchema } from '@/features/bank/schemas/global-bank-account';
import {
    connectedBank,
    connectedBankAccount,
    globalBank,
    globalBankAccount,
} from '@/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import z from 'zod';

export const globalBankTableConfig = createFeatureTableConfig(globalBank)
    .restrictUpsertFields([
        'bic',
        'color',
        'country',
        'currency',
        'integrationTypes',
        'logo',
        'name',
        'providerSource',
        'providerId',
    ])
    .enablePagination()
    .enableFiltering({
        search: z.string(),
        country: z.string().length(2),
    })
    .build();

export const globalBankAccountTableConfig = createFeatureTableConfig(globalBankAccount)
    .transformBaseSchema((base) =>
        base.extend({
            transformConfig: transformConfigSchema,
        })
    )
    .enablePagination()
    .enableFiltering({
        globalBankId: z.string(),
        type: z.enum(['checking', 'savings', 'credit_card', 'investment']),
    })
    .restrictUpsertFields([
        'globalBankId',
        'type',
        'name',
        'description',
        'transformQuery',
        'transformConfig',
        'sampleTransformData',
    ])
    .build();

export const connectedBankTableConfig = createFeatureTableConfig(connectedBank)
    .transformBaseSchema((base) =>
        base.extend({
            apiCredentials: apiCredentialsSchema,
        })
    )
    .enablePagination()
    .enableFiltering({
        globalBankId: z.string(),
        type: z.enum(['checking', 'savings', 'credit_card', 'investment']),
    })
    .build();

export const connectedBankAccountTableConfig = createFeatureTableConfig(connectedBankAccount)
    .enableFiltering({
        connectedBankId: z.string(),
        type: z.enum(['checking', 'savings', 'credit_card', 'investment']),
    })
    .enablePagination()
    .build();
