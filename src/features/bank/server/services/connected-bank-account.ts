import { connectedBankAccountSchemas } from '@/features/bank/schemas/connected-bank-account';
import { connectedBankAccountQueries } from '@/features/bank/server/db/queries/connected-bank-account';
import { globalBankAccountServices } from '@/features/bank/server/services/global-bank-account';
import { AppErrors } from '@/server/lib/error';
import { createFeatureServices } from '@/server/lib/service';

export const connectedBankAccountServices = createFeatureServices('connectedBankAccount')
    .registerSchemas(connectedBankAccountSchemas)
    .registerQueries(connectedBankAccountQueries)
    .registerCoreServices()
    .addService('create', ({ queries }) => ({
        operation: 'create connected bank account',
        throwOnNull: true,
        fn: async ({ data, userId }) => {
            const { name, globalBankAccountId } = data;

            // get the global bank account
            const globalBankAccount = await globalBankAccountServices.getById({
                ids: { id: globalBankAccountId },
            });

            if (!globalBankAccount) {
                throw AppErrors.resource('NOT_FOUND', {
                    message: 'Global bank account not found',
                    details: {
                        globalBankAccountId,
                    },
                    layer: 'service',
                });
            }

            const connectedBankAccount = await queries.create({
                data: {
                    ...data,
                    userId,
                    name: name || globalBankAccount.name,
                    type: globalBankAccount.type,
                },
                userId,
            });

            return connectedBankAccount;
        },
    }))
    .build();
