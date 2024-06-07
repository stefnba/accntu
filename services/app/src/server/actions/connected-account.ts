import { db } from '@db';
import { bank, connectedAccount, connectedBank } from '@db/schema';
import { createId } from '@paralleldrive/cuid2';
import { InferInsertModel, and, eq } from 'drizzle-orm';

export const getConnectedAccounts = async (userId: string) => {
    const data = await db
        .select({
            account: connectedAccount,
            bank: bank
        })
        .from(connectedAccount)
        .innerJoin(connectedBank, eq(connectedAccount.bankId, connectedBank.id))
        .innerJoin(bank, eq(connectedBank.bankId, bank.id))
        .where(and(eq(connectedBank.userId, userId)));

    return data;
};

export const getConnectedAccount = async (id: string, userId: string) => {
    const data = await db
        .select()
        .from(connectedAccount)
        .leftJoin(connectedBank, eq(connectedAccount.bankId, connectedBank.id))
        .where(and(eq(connectedBank.id, id), eq(connectedBank.userId, userId)));

    return data;
};

export const createConnectedAccounts = async (
    values: Pick<
        InferInsertModel<typeof connectedAccount>,
        'bankId' | 'name' | 'type' | 'description'
    >
) => {
    const id = createId();
    const data = await db
        .insert(connectedAccount)
        .values({
            id,
            ...values
        })
        .returning();
    return data;
};
