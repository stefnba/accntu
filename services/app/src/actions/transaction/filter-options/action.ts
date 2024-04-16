'use server';

import db from '@/db';
import { createFetch } from '@/lib/actions/fetch';

export const listFilterOptions = createFetch(async (user) => {
    const a = await db.transaction.groupBy({
        by: 'accountId',
        _count: {
            id: true
        },
        where: {
            userId: user.id
        }
    });

    return a;
});
