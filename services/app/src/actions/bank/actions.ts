'use server';

import { db } from '@/db';
import { createFetch } from '@/lib/actions';

import {
    FindByBankIdSchema,
    FindByIdSchema,
    ListByCountrySchema
} from './schema';

/**
 * List banks for given country
 */
export const listByCountry = createFetch(async ({ data: { country } }) => {
    return db.query.bank.findMany({
        where: (fields, { eq }) => eq(fields.country, country)
    });
}, ListByCountrySchema);

/**
 * Find a bank by id
 */
export const findById = createFetch(async ({ data: { id } }) => {
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
export const findUploadAccountsByBankId = createFetch(
    async ({ data: { bankId } }) => {
        const record = await db.query.bankUploadAccounts.findMany({
            where: (fields, { eq }) => eq(fields.bankId, bankId)
        });

        if (!record) {
            throw new Error('Record not found');
        }
        return record;
    },
    FindByBankIdSchema
);
