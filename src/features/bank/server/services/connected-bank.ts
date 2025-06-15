import { TCreateConnectedBank } from '@/features/bank/schemas';
import { createConnectedBankAccount } from '@/features/bank/server/services/connected-bank-accounts';
import { bankQueries } from '../db/queries';

/**
 * Create a new connected bank together with the related bank accounts the users wants to link to the bank.
 * @param userId - The user ID
 * @param data - The data to create the connected bank with
 * @returns The created connected bank
 */
export const createConnectedBankWithAccounts = async ({
    userId,
    data,
}: {
    userId: string;
    data: TCreateConnectedBank;
}) => {
    const { globalBankId, connectedBankAccounts } = data;

    // Create the connected bank
    let connectedBank = await bankQueries.connectedBank.create({
        data: {
            userId,
            globalBankId,
        },
    });

    // If the connected bank was not created, it likely already exists for this user
    if (!connectedBank) {
        connectedBank = await bankQueries.connectedBank.getByGlobalBankId({
            userId,
            globalBankId,
        });
    }

    // if still no connected bank, throw an error
    if (!connectedBank) {
        throw new Error('Failed to create connected bank');
    }

    console.log(
        'connectedBank',
        connectedBankAccounts.map((account) => account.globalBankAccountId)
    );

    // Create the connected bank accounts
    const createdAccounts = await Promise.all(
        connectedBankAccounts.map((account) =>
            createConnectedBankAccount({
                userId,
                data: {
                    connectedBankId: connectedBank.id,
                    globalBankAccountId: account.globalBankAccountId,
                },
            })
        )
    );

    console.log('createdAccounts', createdAccounts);

    return {
        ...connectedBank,
    };
};
