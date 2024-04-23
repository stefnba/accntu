'use server';

import { db, schema as dbSchema } from '@/db';
import { createMutation } from '@/lib/mutation';
import { Transaction, TransactionType } from '@prisma/client';

import { CreateLabelSchema } from './schema';

/**
 * Create import record.
 */
export const createLabel = createMutation(
    async ({ name, parentLabelId }, user) => {
        const newLabel = await db
            .insert(dbSchema.label)
            .values({
                name,
                parentId: parentLabelId,
                userId: user.id
            })
            .returning();

        return {
            ...newLabel[0],
            success: true
        };
    },
    CreateLabelSchema
);
