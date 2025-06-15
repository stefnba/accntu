import { TInsertConnectedBankAccount } from '@/features/bank/schemas';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq } from 'drizzle-orm';
import { db } from '../../../../../server/db';
import { connectedBank, connectedBankAccount, type ConnectedBankAccount } from '../schemas';

/**
 * Get all connected bank accounts by user id
 * @param userId - The id of the user
 * @returns All connected bank accounts by user id
 */
export const getByUserId = async ({ userId }: { userId: string }) =>
    withDbQuery({
        operation: 'get connected bank accounts by user ID',
        queryFn: async () => {
            const result = await db
                .select()
                .from(connectedBankAccount)
                .innerJoin(
                    connectedBank,
                    eq(connectedBankAccount.connectedBankId, connectedBank.id)
                )
                .where(
                    and(eq(connectedBank.userId, userId), eq(connectedBankAccount.isActive, true))
                );

            return result;
        },
    });

/**
 * Create a connected bank account
 * @param data - The data to create the connected bank account
 * @returns The created connected bank account
 */
export const create = async ({ data }: { data: TInsertConnectedBankAccount }) =>
    withDbQuery({
        operation: 'create connected bank account',
        queryFn: async () => {
            const result = await db.insert(connectedBankAccount).values(data).returning();
            return result[0];
        },
    });

/**
 * Get all connected bank accounts by connected bank id
 * @param connectedBankId - The id of the connected bank
 * @returns All connected bank accounts by connected bank id
 */
export const getByConnectedBankId = async ({
    connectedBankId,
}: {
    connectedBankId: string;
}): Promise<ConnectedBankAccount[]> =>
    withDbQuery({
        operation: 'get connected bank accounts by connected bank ID',
        queryFn: async () => {
            return await db
                .select()
                .from(connectedBankAccount)
                .where(
                    and(
                        eq(connectedBankAccount.connectedBankId, connectedBankId),
                        eq(connectedBankAccount.isActive, true)
                    )
                );
        },
    });

/**
 * Get a connected bank account by id
 * @param id - The id of the connected bank account
 * @returns The connected bank account
 */
export const getById = async ({ id }: { id: string }): Promise<ConnectedBankAccount | null> =>
    withDbQuery({
        operation: 'get connected bank account by ID',
        queryFn: async () => {
            const result = await db
                .select()
                .from(connectedBankAccount)
                .where(eq(connectedBankAccount.id, id))
                .limit(1);
            return result[0] || null;
        },
    });
