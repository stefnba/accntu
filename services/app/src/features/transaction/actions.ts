'use server';

/**
 * Fetch filter options for transactions.
 */
export const listFilterOptions = createQueryFetch(
    async ({ user, data: { filterKey, filters } }) => {
        const filter = and(
            eq(dbSchema.transaction.userId, user.id),
            eq(dbSchema.transaction.isDeleted, false),
            ...Object.values(filters || []).map((f) => f)
        );

        const filterQueries = {
            label: getFilterOptions(
                dbSchema.transaction,
                dbSchema.transaction.labelId,
                filter,
                dbSchema.label,
                dbSchema.label.name,
                [dbSchema.transaction.labelId, dbSchema.label.id]
            ),
            account: getFilterOptions(
                dbSchema.transaction,
                dbSchema.transaction.accountId,
                filter,
                dbSchema.connectedAccount,
                dbSchema.connectedAccount.name,
                [dbSchema.transaction.accountId, dbSchema.connectedAccount.id]
            ),
            title: getFilterOptions(
                dbSchema.transaction,
                dbSchema.transaction.title,
                filter
            ),
            spendingCurrency: getFilterOptions(
                dbSchema.transaction,
                dbSchema.transaction.spendingCurrency,
                filter
            ),
            accountCurrency: getFilterOptions(
                dbSchema.transaction,
                dbSchema.transaction.accountCurrency,
                filter
            ),
            date: undefined
        };

        const query = await filterQueries[filterKey];

        return query;
    },
    FilterOptionsSchema
);
