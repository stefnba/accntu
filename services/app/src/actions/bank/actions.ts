'use server';

import { db } from '@/db';
import { createFetch } from '@/lib/actions/fetch';

import { FindByBankIdSchema, FindByIdSchema } from './schema';

/**
 * Find a bank by id
 */
export const findById = createFetch(async (_, { id }) => {
    const record = await db.query.bank.findFirst({
        where: (fields, { eq }) => eq(fields.id, id)
    });

    if (!record) {
        throw new Error('Record not found');
    }
    return record;
}, FindByIdSchema);

/**
 * Find all bank upload accounts by bankId
 */
export const findUploadAccountsByBankId = createFetch(async (_, { bankId }) => {
    const record = await db.query.bankUploadAccounts.findMany({
        where: (fields, { eq }) => eq(fields.bankId, bankId)
    });

    if (!record) {
        throw new Error('Record not found');
    }
    return record;
}, FindByBankIdSchema);