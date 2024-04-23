import { Varela } from 'next/font/google';

import { getUser } from '@/auth';
import { PageHeader } from '@/components/page/header';
import { db, schema } from '@/db';
import { label, transaction } from '@/lib/db/schema';
import { inArrayFilter, inArrayWithNullFilter } from '@/lib/db/utils';
import {
    type BinaryOperator,
    SQL,
    and,
    eq,
    ilike,
    inArray,
    is,
    isNotNull,
    isNull,
    or,
    sql
} from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';
import { z } from 'zod';

type FilterDict = Record<string, FilterDictValue | undefined>;

const TransactionFilterSchema = z.object({
    label: z
        .array(z.string().nullable())
        .optional()
        .transform((val) =>
            inArrayWithNullFilter(schema.transaction.labelId, val)
        ),
    account: z
        .array(z.string().nullable())
        .optional()
        .transform((val) =>
            inArrayWithNullFilter(schema.transaction.labelId, val)
        ),
    spendingCurrency: z
        .array(z.string())
        .optional()
        .transform((val) =>
            inArrayFilter(schema.transaction.spendingCurrency, val)
        )
});

export type TTransactionFilterSchema = z.output<typeof TransactionFilterSchema>;

export default async function Home() {
    const user = await getUser();

    const filter = {
        label: ['83dde3c5-b108-44a3-8a7d-7612e7450d6a']
    };

    const parsed = TransactionFilterSchema.safeParse(filter);

    if (!parsed.success) {
        console.log(parsed.error);
        return;
    }

    const aaa = parsed.data;

    const trans = await db
        .select({
            id: schema.transaction.id,

            label
        })
        .from(schema.transaction)
        .leftJoin(label, eq(label.id, schema.transaction.labelId))
        .where(and(...Object.values(aaa).map((f) => f)));

    console.log(JSON.stringify(trans, null, 4));
    return (
        <div>
            <PageHeader title="Home" />
            Hi {user.email}
        </div>
    );
}
