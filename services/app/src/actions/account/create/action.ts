'use server';

import db from '@/db';
import { createMutation } from '@/lib/mutation';

import { CreatAccountSchema } from './schema';

/**
 * Create account record.
 */
export const createAccount = createMutation(async (data, user) => {
    const { bankId, accounts } = data;

    // Create parent
    const parentAccount = await db.transactionAccount.create({
        data: {
            userId: user.id,
            name: 'Account',
            isLeaf: false,
            bankId: bankId,
            type: 'CURRENT'
        }
    });

    const newAccounts = await Promise.all(
        accounts.map(async (account) => {
            const providerAccount = await db.bankUploadAccounts.findUnique({
                where: { id: account }
            });

            if (!providerAccount) {
                throw new Error('Invalid account');
            }

            const newAccount = await db.transactionAccount.create({
                data: {
                    userId: user.id,
                    name: 'ddd',
                    isLeaf: true,
                    bankId: bankId,
                    type: providerAccount?.type,
                    accountParentId: parentAccount.id
                }
            });

            return {
                id: newAccount.id
            };
        })
    );

    return {
        id: parentAccount.id,
        accounts: newAccounts
    };
}, CreatAccountSchema);
