'use server';

import db from '@/db';
import { createMutation } from '@/lib/mutation';

import { UpdateTransactionSchema } from './schema';

export const updateTransaction = createMutation(async (data, user) => {
    const updated = await db.transaction.update({
        where: { userId: user.id, id: data.id },
        data: data
    });

    return updated;
}, UpdateTransactionSchema);
