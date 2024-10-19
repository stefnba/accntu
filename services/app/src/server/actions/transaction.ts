import { FilterTransactionSchema } from '@/features/transaction/schema/table-filtering';
import { PaginationTransactionSchema } from '@/features/transaction/schema/table-pagination';
import { inArrayFilter, queryBuilder } from '@/server/db/utils';
import { db } from '@db';
import {
    InsertTransactionSchema,
    SelectTagSchema,
    bank,
    connectedAccount,
    connectedBank,
    label,
    tag,
    tagToTransaction,
    transaction,
    transactionImport,
    transactionImportFile
} from '@db/schema';
import { createId } from '@paralleldrive/cuid2';
import { getTableColumns, sql } from 'drizzle-orm';
import { and, count, eq } from 'drizzle-orm';
import { z } from 'zod';

const TagSchema = SelectTagSchema.pick({
    id: true,
    name: true,
    color: true,
    createdAt: true
});

/**
 * Create new transaction records.
 */
export const createTransactions = async ({
    values,
    importFileId,
    accountId,
    userId
}: {
    values: z.infer<typeof InsertTransactionSchema>[];
    importFileId: string;
    accountId: string;
    userId: string;
}) => {
    // create transaction records
    const newTransactions = await db
        .insert(transaction)
        .values(
            values.map((transaction) => ({
                ...transaction,
                id: createId(),
                accountId,
                userId,
                importFileId
            }))
        )
        .returning()
        .onConflictDoNothing();

    // update import file
    const [importFileRecord] = await db
        .update(transactionImportFile)
        .set({
            importedAt: new Date(),
            transactionCount: values.length,
            importedTransactionCount: newTransactions.length,
            updatedAt: new Date()
        })
        .where(and(eq(transactionImportFile.id, importFileId)))
        .returning();

    if (!importFileRecord) {
        throw new Error('Import file not found');
    }

    const importRecord = await db.query.transactionImport.findFirst({
        where: (fields, { eq, and }) =>
            and(
                eq(fields.id, importFileRecord.importId),
                eq(fields.userId, userId)
            )
    });

    if (!importRecord) {
        throw new Error('Import not found');
    }

    const currentFileCount = importRecord.importedFileCount || 0;
    const currentTransactionCount = importRecord.importedTransactionCount || 0;

    if (currentFileCount + 1 > (importRecord.fileCount || 0)) {
        throw new Error('Import file count exceeded');
    }

    // update import record
    const [updatedImportRecord] = await db
        .update(transactionImport)
        .set({
            importedFileCount: currentFileCount + 1,
            importedTransactionCount:
                currentTransactionCount + newTransactions.length,
            successAt:
                currentFileCount + 1 === importRecord.fileCount
                    ? new Date()
                    : null
        })
        .where(
            and(
                eq(transactionImport.id, importFileRecord.importId),
                eq(transactionImport.userId, userId)
            )
        )
        .returning();

    return {
        transactions: newTransactions,
        allImported: updatedImportRecord.successAt !== null,
        importId: importRecord.id
    };
};

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
            tags: sql<(typeof TagSchema)[]>`(
                SELECT
                    coalesce(json_agg(json_build_object(
                        'id', ${tag.id},
                        'name', ${tag.name},
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

export const updateTransactions = async (
    data: any,
    id: string,
    userId: string
) => {
    await db
        .update(transaction)
        .set(data)
        .where(
            and(
                eq(transaction.userId, userId),
                Array.isArray(id)
                    ? inArrayFilter(transaction.id, id)
                    : eq(transaction.id, id)
            )
        )
        .returning();
};
