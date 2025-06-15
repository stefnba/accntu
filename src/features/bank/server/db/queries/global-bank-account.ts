import { withDbQuery } from '@/server/lib/handler';
import { and, eq } from 'drizzle-orm';
import { db } from '../../../../../server/db';
import { globalBankAccount, type GlobalBankAccount } from '../schemas';

/**
 * Get all global bank accounts by bank id
 * @param globalBankId - The id of the global bank
 * @returns All global bank accounts by bank id
 */
export const getByBankId = async ({
    globalBankId,
}: {
    globalBankId: string;
}): Promise<GlobalBankAccount[]> =>
    withDbQuery({
        operation: 'get global bank accounts by bank ID',
        queryFn: async () => {
            return await db
                .select()
                .from(globalBankAccount)
                .where(
                    and(
                        eq(globalBankAccount.globalBankId, globalBankId),
                        eq(globalBankAccount.isActive, true)
                    )
                );
        },
    });

/**
 * Get a global bank account by id
 * @param id - The id of the global bank account
 * @returns The global bank account
 */
export const getById = async ({ id }: { id: string }): Promise<GlobalBankAccount | null> =>
    withDbQuery({
        operation: 'get global bank account by ID',
        queryFn: async () => {
            const result = await db
                .select()
                .from(globalBankAccount)
                .where(eq(globalBankAccount.id, id))
                .limit(1);
            return result[0] || null;
        },
    });
