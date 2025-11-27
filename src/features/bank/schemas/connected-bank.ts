import { apiCredentialsSchema } from '@/features/bank/schemas/common';
import { connectedBankTableConfig } from '@/features/bank/server/db/config';
import { createFeatureSchemas } from '@/lib/schema';
import { z } from 'zod';

export type TApiCredentials = z.infer<typeof apiCredentialsSchema>;

export const connectedBankSchemas = createFeatureSchemas(connectedBankTableConfig)
    .registerAllStandard()
    .addSchema('createWithAccounts', ({ schemas }) => {
        const schema = schemas.inputData.insert.extend({
            connectedBankAccounts: z.array(
                z.object({
                    globalBankAccountId: z.string(),
                })
            ),
        });

        return {
            service: z.object({ data: schema, userId: z.string() }),
            query: z.object({ data: schema, userId: z.string() }),
            endpoint: {
                json: schema,
            },
        };
    })
    .build();

export type { TConnectedBank } from '@/features/bank/server/db/queries/connected-bank';
