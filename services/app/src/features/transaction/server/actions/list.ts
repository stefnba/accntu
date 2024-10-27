import { FilterTransactionSchema } from '@/features/transaction/schema/table-filtering';
import { PaginationTransactionSchema } from '@/features/transaction/schema/table-pagination';
import { queryBuilder } from '@/server/db/utils';
import { db } from '@db';
import {
    bank,
    connectedAccount,
    connectedBank,
    label,
    tag,
    tagToTransaction,
    transaction
} from '@db/schema';
import { SelectTagSchema } from '@features/tag/schema/get-tag';
import { getTableColumns, sql } from 'drizzle-orm';
import { and, count, eq } from 'drizzle-orm';
import { z } from 'zod';

const TagSchema = SelectTagSchema.pick({
    id: true,
    name: true,
    color: true,
    createdAt: true,
    description: true
});

/**
 * List transaction records with pagination, ordering, filtering.
 */
export const listTransactions = async ({
    userId,
    filters,
    pagination
}: {
    filters: z.infer<typeof FilterTransactionSchema>;
    pagination: z.infer<typeof PaginationTransactionSchema>;
    userId: string;
}) => {
    const filterClause = and(
        eq(transaction.userId, userId),
        eq(transaction.isDeleted, false),
        ...Object.values(filters).map((f) => f)
    );

    const transactionCount = (
        await db
            .select({ count: count() })
            .from(transaction)
            .where(filterClause)
    )[0].count;

    const transactionsQuery = db
        .select({
            id: transaction.id,
            title: transaction.title,
            key: transaction.key,
            date: transaction.date,
            note: transaction.note,
            city: transaction.city,
            userId: transaction.userId,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
            country: transaction.country,
            isNew: transaction.isNew,
            type: transaction.type,
            accountAmount: transaction.accountAmount,
            accountCurrency: transaction.accountCurrency,
            spendingAmount: transaction.spendingAmount,
            spendingCurrency: transaction.spendingCurrency,
            importFileId: transaction.importFileId,
            label: getTableColumns(label),
            account: {
                id: connectedAccount.id,
                name: connectedAccount.name,
                type: connectedAccount.type,
                bankName: bank.name,
                bankColor: bank.color,
                bankLogo: bank.logo,
                bankCountry: bank.country
            },
            tags: sql<z.infer<typeof TagSchema>[]>`(
                SELECT
                    coalesce(json_agg(json_build_object(
                        'id', ${tag.id},
                        'name', ${tag.name},
                        'description', ${tag.description},
                        'color', ${tag.color},
                        'createdAt', ${tagToTransaction.createdAt}
                    ) ORDER BY ${tagToTransaction.createdAt} ASC),'[]'::json) AS "data"
                FROM
                    ${tagToTransaction}
                LEFT JOIN
                    ${tag} ON ${tagToTransaction.tagId} = ${tag.id}
                WHERE
                    ${tagToTransaction.transactionId} = ${transaction.id}
            )`
        })
        .from(transaction)
        .leftJoin(label, eq(label.id, transaction.labelId))
        // .leftJoin(
        //     tagToTransaction,
        //     eq(tagToTransaction.transactionId, transaction.id)
        // )
        .leftJoin(
            connectedAccount,
            eq(connectedAccount.id, transaction.accountId)
        )
        .leftJoin(connectedBank, eq(connectedAccount.bankId, connectedBank.id))
        .leftJoin(bank, eq(connectedBank.bankId, bank.id));

    const transactions = queryBuilder(transactionsQuery.$dynamic(), {
        orderBy: [
            { column: transaction.date, direction: 'desc' },
            { column: transaction.key, direction: 'asc' }
        ],
        filters: filterClause,
        page: pagination.page,
        pageSize: pagination.pageSize
    });

    return {
        count: transactionCount,
        transactions: await transactions
    };
};
