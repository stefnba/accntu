'use server';

import db from '@/db';
import { createMutation } from '@/lib/mutation';

import { UpdateImportSchema } from './schema';

/**
 * Update import record.
 */
export const updateImport = createMutation(async (data, user) => {
    await db.import.update({
        data: {
            successAt: new Date()
        },
        where: {
            id: data.id,
            userId: user.id
        }
    });
}, UpdateImportSchema);
