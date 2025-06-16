import { type TInsertConnectedBank } from '@/features/bank/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq } from 'drizzle-orm';
import { connectedBank, type ConnectedBank } from '../schemas';

/**
 * Get all connected banks by user id
 * @param userId - The id of the user
 * @returns All connected banks by user id
 */
export const getAll = async ({ userId }: { userId: string }) =>
    withDbQuery({
        operation: 'get connected banks by user ID',
        queryFn: async () => {
            return await db.query.connectedBank.findMany({
                where: and(eq(connectedBank.userId, userId), eq(connectedBank.isActive, true)),
                with: {
                    globalBank: true,
                    connectedBankAccounts: {
                        with: {
                            globalBankAccount: true,
                        },
                    },
                },
            });
        },
    });

/**
 * Get a connected bank by id
 * @param id - The id of the connected bank
 * @param userId - The id of the user
 * @returns The connected bank
 */
export const getById = async ({ id, userId }: { id: string; userId: string }) =>
    withDbQuery({
        operation: 'get connected bank by ID',
        queryFn: async () => {
            const result = await db.query.connectedBank.findFirst({
                where: and(eq(connectedBank.id, id), eq(connectedBank.userId, userId)),
                with: {
                    globalBank: true,
                    connectedBankAccounts: {
                        with: {
                            globalBankAccount: true,
                        },
                    },
                },
            });
            return result || null;
        },
    });

/**
 * Get a connected bank by global bank id
 * @param globalBankId - The id of the global bank
 * @returns The connected bank
 */
export const getByGlobalBankId = async ({
    globalBankId,
    userId,
}: {
    globalBankId: string;
    userId: string;
}): Promise<ConnectedBank | null> =>
    withDbQuery({
        operation: 'get connected bank by global bank ID',
        queryFn: async () => {
            const result = await db
                .select()
                .from(connectedBank)
                .where(
                    and(
                        eq(connectedBank.globalBankId, globalBankId),
                        eq(connectedBank.userId, userId)
                    )
                );
            return result[0] || null;
        },
    });

/**
 * Create a connected bank
 * @param data - The data to create the connected bank
 * @returns The created connected bank
 */
export const create = async ({
    data,
}: {
    data: TInsertConnectedBank;
}): Promise<ConnectedBank | null> =>
    withDbQuery({
        operation: 'create connected bank',
        queryFn: async () => {
            const result = await db
                .insert(connectedBank)
                .values(data)
                .returning()
                .onConflictDoNothing();
            return result[0];
        },
        allowNull: true,
    });
