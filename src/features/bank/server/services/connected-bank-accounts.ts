import { bankQueries } from '@/features/bank/server/db/queries';

export const createConnectedBankAccount = async ({
    userId,
    data,
}: {
    userId: string;
    data: {
        connectedBankId: string;
        globalBankAccountId?: string | null | undefined;
    };
}) => {
    const { connectedBankId, globalBankAccountId } = data;

    if (!globalBankAccountId) {
        throw new Error('Global bank account ID is required');
    }

    const globalBankAccount = await bankQueries.globalBankAccount.getById({
        id: globalBankAccountId,
    });

    if (!globalBankAccount) {
        throw new Error('Global bank account not found');
    }

    const connectedBankAccount = await bankQueries.connectedBankAccount.create({
        data: {
            connectedBankId,
            globalBankAccountId: globalBankAccountId,
            name: globalBankAccount.name,
        },
    });

    return connectedBankAccount;
};
