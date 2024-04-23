'use server';

import { db, schema as dbSchema } from '@/db';
import { createFetch } from '@/lib/actions/fetch';
import { and, eq, sql } from 'drizzle-orm';

import { FilterOptionsSchema } from './schema';

export const listFilterOptions = createFetch(async (user, { filterKey }) => {
    // if (filterKey === 'label') return labelOptions(user.id);

    const filterKeys = {
        label: dbSchema.transaction.labelId,
        account: dbSchema.transaction.accountId,
        title: dbSchema.transaction.title
    };

    const a = filterKeys[filterKey];

    const test = await db
        .select({
            value: dbSchema.transaction.labelId,
            label: sql<string>`COALESCE(${dbSchema.label.name}, 'None')`,
            count: sql<number>`cast(count(*) as int)`
        })
        .from(dbSchema.transaction)
        .where(
            and(
                eq(dbSchema.transaction.userId, user.id),
                eq(dbSchema.transaction.isDeleted, false)
            )
        )
        .leftJoin(
            dbSchema.label,
            eq(dbSchema.transaction.labelId, dbSchema.label.id)
        )
        .groupBy(dbSchema.transaction.labelId, dbSchema.label.name);

    console.log('test', test);

    return test;
}, FilterOptionsSchema);
