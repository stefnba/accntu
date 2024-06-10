import { getFilterOptions } from '@/components/data-table/filters/select/db-utils';
import {
    FilterTransactionSchema,
    type TTransactionFilterKeys
} from '@/features/transaction/schema/table-filtering';
import { connectedAccount, label, transaction } from '@db/schema';
import { and, eq } from 'drizzle-orm';
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
        endDate: undefined,
        startDate: undefined
    };

    const query = await filterQueries[filterKey];

    return query;
};
