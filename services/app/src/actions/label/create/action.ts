'use server';

import db from '@/db';
import { createMutation } from '@/lib/mutation';
import { Transaction, TransactionType } from '@prisma/client';

import { CreateLabelSchema } from './schema';

/**
 * Create import record.
 */
export const createLabel = createMutation(
    async ({ name, parentLabelId }, user) => {
        const newLabel = await db.label.create({
            data: {
                name,
                labelId: parentLabelId,
                userId: user.id
            }
        });

        return {
            ...newLabel,
            success: true
        };
    },
    CreateLabelSchema
);
