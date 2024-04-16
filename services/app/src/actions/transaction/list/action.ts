'use server';

import db from '@/db';
import { createFetch } from '@/lib/actions/fetch';

import { ListTransactionSchema } from './schema';

export const listTransactions = createFetch(
    async (user, { pageSize, page, ...filters }) => {
        const count = await db.transaction.count({
            where: {
                userId: user.id,

                ...filters
            }
        });

        const transactions = await db.transaction.findMany({
            include: {
                account: {
                    select: {
                        name: true
                    }
                },
                label: {
                    select: {
                        name: true
                    }
                }
            },
            where: {
                userId: user.id,
                isDeleted: false,
                ...filters
            },
            orderBy: { date: 'desc' },
            take: pageSize,
            skip: ((page ?? 1) - 1) * (pageSize ?? 0)
        });

        return {
            count: count,
            transactions
        };
    },
    ListTransactionSchema
);
