import { db } from '@db';
import { connectedAccount, connectedBank } from '@db/schema';
import { createId } from '@paralleldrive/cuid2';
import { CreateConnectedBankSchema } from '@server/api/connectedBank';
import { z } from 'zod';

type TCreateConnectedBank = z.output<typeof CreateConnectedBankSchema>;

/**
 * Create new connected bank record and specified connectedAccounts.
 */
export const createConnectedBank = async (
    userId: string,
    values: TCreateConnectedBank
) => {
    // create connectedBank record
    const [newBank] = await db
        .insert(connectedBank)
        .values({
            id: createId(),
            userId,
            bankId: values.bankId
        })
        .returning();

    const accounts = await Promise.all(
        values.accounts.map(async (a) => {
            const uploadAccount = await db.query.bankUploadAccounts.findFirst({
                where: (fields, { eq }) => eq(fields.id, a)
            });

            if (!uploadAccount) {
                throw new Error('Invalid account');
            }

            const mapping = {
                CREDIT_CARD: 'Credit Card',
                CURRENT: 'Current Account',
                SAVING: 'Savings Account'
            };

            return {
                id: createId(),
                bankId: newBank.id,
                name: mapping[uploadAccount.type],
                type: uploadAccount.type
            };
        })
    );

    const newAccounts = await db
        .insert(connectedAccount)
        .values(accounts)
        .returning();

    return {
        bank: newBank,
        accounts: newAccounts
    };
};
