'use server';

import { db, schema as dbSchema } from '@/db';
import { createFetch } from '@/lib/actions';
import { createMutation } from '@/lib/actions';

import { CreateAccountSchema, FindAccountByIdSchema } from './schema';

/**
 * List account records for logged in user.
 */
export const list = createFetch(async ({ user }) => {
    return db.query.transactionAccount.findMany({
        where: (fields, { eq }) => eq(fields.userId, user.id)
    });
});

/**
 * Retrieve one account by id.
 */
export const findAccountById = createFetch(async ({ user, data: { id } }) => {
    const record = await db.query.transactionAccount.findFirst({
        where: (fields, { eq, and }) =>
            and(eq(fields.userId, user.id), eq(fields.id, id))
    });

    if (!record) {
        throw new Error('Record not found');
    }

    return record;
}, FindAccountByIdSchema);

/**
 * Create account record.
 */
export const create = createMutation(async ({ user, data }) => {
    const { bankId, accounts } = data;

    // Create parent
    const parentAccount = await db
        .insert(dbSchema.transactionAccount)
        .values({
            userId: user.id,
            name: 'Account',
            isLeaf: false,
            bankId: bankId,
            type: 'CURRENT'
        })
        .returning();

    const newAccounts = await Promise.all(
        accounts.map(async (account) => {
            const providerAccount = await db.query.bankUploadAccounts.findFirst(
                {
                    where: (fields, operators) =>
                        operators.eq(fields.id, account)
                }
            );

            if (!providerAccount) {
                throw new Error('Invalid account');
            }

            const newAccount = await db
                .insert(dbSchema.transactionAccount)
                .values({
                    userId: user.id,
                    name: 'ddd',
                    isLeaf: true,
                    bankId: bankId,
                    type: providerAccount?.type,
                    parentId: parentAccount[0].id
                })
                .returning();

            return {
                id: newAccount[0].id
            };
        })
    );

    return {
        id: parentAccount[0].id,
        accounts: newAccounts
    };
}, CreateAccountSchema);
