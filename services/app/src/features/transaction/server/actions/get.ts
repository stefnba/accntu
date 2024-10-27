import { db } from '@db';
import { GetTransactionByIdSchema } from '@features/transaction/schema';
import { z } from 'zod';

/**
 * Retrieve a transaction by its id.
 */
export const getTransactionById = async ({
    transactionId,
    userId
}: z.infer<typeof GetTransactionByIdSchema> & { userId: string }) => {
    const data = await db.query.transaction.findFirst({
        where: (fields, { and, eq }) =>
            and(eq(fields.id, transactionId), eq(fields.userId, userId)),
        with: {
            tags: {
                with: {
                    tag: true
                }
            },
            label: true,
            account: {
                with: {
                    bank: {
                        with: {
                            bank: true
                        }
                    }
                }
            }
        }
    });

    return data;
};
