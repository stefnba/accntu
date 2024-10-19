import { getFilterOptions } from '@/components/data-table/filters/select/db-utils';
import {
    FilterTransactionSchema,
    type TTransactionFilterKeys
} from '@/features/transaction/schema/table-filtering';
import { db } from '@db';
import {
    connectedAccount,
    label,
    tag,
    tagToTransaction,
    transaction
} from '@db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

type TFilterOptions = {
    filters: z.output<typeof FilterTransactionSchema> | undefined;
    filterKey: TTransactionFilterKeys;
    userId: string;
};

export const listFilterOptions = async ({
    userId,
    filterKey,
    filters
}: TFilterOptions) => {
    // Remove the filterKey from the filters object to show all options for this filterKey
    if (filters) {
        delete filters[filterKey];
    }

    const filter = and(
        eq(transaction.userId, userId),
        eq(transaction.isDeleted, false),
        ...Object.values(filters || []).map((f) => f)
    );

    const filterQueries = {
        label: getFilterOptions(
            transaction,
            transaction.labelId,
            filter,
            label,
            label.name,
            [transaction.labelId, label.id]
        ),
        account: getFilterOptions(
            transaction,
            transaction.accountId,
            filter,
            connectedAccount,
            connectedAccount.name,
            [transaction.accountId, connectedAccount.id]
        ),
        title: getFilterOptions(transaction, transaction.title, filter),
        spendingCurrency: getFilterOptions(
            transaction,
            transaction.spendingCurrency,
            filter
        ),
        accountCurrency: getFilterOptions(
            transaction,
            transaction.accountCurrency,
            filter
        ),
        type: getFilterOptions(transaction, transaction.type, filter),
        endDate: undefined,
        startDate: undefined,
        tag: db
            .select({
                value: tagToTransaction.tagId,
                label: sql<string>`COALESCE(${tag.name}, 'None')`,
                count: sql<number>`CAST(count(*) as int)`
            })
            .from(tagToTransaction)
            .leftJoin(
                transaction,
                eq(transaction.id, tagToTransaction.transactionId)
            )
            .leftJoin(tag, eq(tag.id, tagToTransaction.tagId))
            .where(filter)
            .groupBy(tagToTransaction.tagId, tag.name)
            .orderBy(sql<string>`3 DESC`)
    };

    const query = await filterQueries[filterKey];

    return query;
};
