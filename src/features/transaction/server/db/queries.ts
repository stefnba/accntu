import { transactionSchemas } from '@/features/transaction/schemas';
import { db, dbTable } from '@/server/db';
import { createFeatureQueries } from '@/server/lib/db/query';
import { and, count, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import { transaction } from './tables';

export const transactionQueries = createFeatureQueries
    .registerSchema(transactionSchemas)
    /**
     * Get many transactions with filters and relations
     */
    .addQuery('getMany', {
        operation: 'Get paginated transactions with filters and relations',
        fn: async ({ userId, filters, pagination }) => {
            const offset = ((pagination?.page || 1) - 1) * (pagination?.pageSize || 50);

            // Build where conditions
            const whereConditions = [
                eq(transaction.userId, userId),
                eq(transaction.isActive, true),
            ];

            // Add filter conditions
            if (filters?.search) {
                whereConditions.push(
                    or(
                        ilike(transaction.title, `%${filters.search}%`),
                        ilike(transaction.description, `%${filters.search}%`),
                        ilike(transaction.counterparty, `%${filters.search}%`)
                    )!
                );
            }

            if (filters?.startDate) {
                whereConditions.push(
                    gte(transaction.date, filters.startDate.toISOString().split('T')[0])
                );
            }

            if (filters?.endDate) {
                whereConditions.push(
                    lte(transaction.date, filters.endDate.toISOString().split('T')[0])
                );
            }

            if (filters?.accountIds?.length) {
                whereConditions.push(
                    inArray(transaction.connectedBankAccountId, filters.accountIds)
                );
            }

            if (filters?.labelIds?.length) {
                whereConditions.push(inArray(transaction.labelId, filters.labelIds));
            }

            if (filters?.type?.length) {
                whereConditions.push(
                    inArray(transaction.type, filters.type as ('transfer' | 'credit' | 'debit')[])
                );
            }

            if (filters?.currencies?.length) {
                whereConditions.push(
                    or(
                        inArray(transaction.spendingCurrency, filters.currencies),
                        inArray(transaction.accountCurrency, filters.currencies)
                    )!
                );
            }

            const whereClause = and(...whereConditions);

            // Get total count
            const [{ totalCount }] = await db
                .select({ totalCount: count() })
                .from(transaction)
                .where(whereClause);

            // Get transactions with relations using Drizzle's query API
            const transactions = await db.query.transaction.findMany({
                where: whereClause,
                with: {
                    account: {
                        with: {
                            connectedBank: {
                                with: {
                                    globalBank: true,
                                },
                            },
                        },
                    },
                    importFile: true,
                    bucketTransaction: {
                        with: {
                            bucket: true,
                        },
                    },
                },
                orderBy: [desc(transaction.date), desc(transaction.createdAt)],
                limit: pagination?.pageSize || 50,
                offset,
            });

            // Get tags for transactions (separate query for optimization)
            const transactionIds = transactions.map((t) => t.id);
            const transactionTagsData =
                transactionIds.length > 0
                    ? await db.query.tagToTransaction.findMany({
                          where: inArray(dbTable.tagToTransaction.transactionId, transactionIds),
                          with: {
                              tag: true,
                          },
                      })
                    : [];

            // Get labels for transactions
            const labelIds = transactions.map((t) => t.labelId).filter((id): id is string => !!id);

            const labelsData =
                labelIds.length > 0
                    ? await db.query.label.findMany({
                          where: inArray(dbTable.label.id, labelIds),
                      })
                    : [];

            // Combine data
            const transactionsWithRelations = transactions.map((transaction) => ({
                ...transaction,
                tags: transactionTagsData
                    .filter((tt) => tt.transactionId === transaction.id)
                    .map((tt) => tt.tag),
                label: transaction.labelId
                    ? labelsData.find((l) => l.id === transaction.labelId)
                    : null,
                bucket: transaction.bucketTransaction?.bucket || null,
            }));

            return {
                transactions: transactionsWithRelations,
                totalCount,
                pagination: {
                    page: pagination?.page || 1,
                    pageSize: pagination?.pageSize || 50,
                    totalCount,
                    totalPages: Math.ceil(totalCount / (pagination?.pageSize || 50)),
                },
            };
        },
    })

    /**
     * Get a transaction by ID
     */
    .addQuery('getById', {
        operation: 'Get single transaction by ID with relations',
        fn: async ({ ids, userId }) => {
            const result = await db.query.transaction.findFirst({
                where: and(
                    eq(transaction.id, ids.id),
                    eq(transaction.userId, userId),
                    eq(transaction.isActive, true)
                ),
                with: {
                    account: {
                        with: {
                            connectedBank: {
                                with: {
                                    globalBank: true,
                                },
                            },
                        },
                    },
                    importFile: true,
                    bucketTransaction: {
                        with: {
                            bucket: true,
                        },
                    },
                },
            });

            if (!result) {
                return null;
            }

            // Get tags for this transaction
            const transactionTagsData = await db.query.tagToTransaction.findMany({
                where: eq(dbTable.tagToTransaction.transactionId, ids.id),
                with: {
                    tag: true,
                },
            });

            // Get label for this transaction
            const labelData = result.labelId
                ? await db.query.label.findFirst({
                      where: eq(dbTable.label.id, result.labelId),
                  })
                : null;

            return {
                ...result,
                tags: transactionTagsData.map((tt) => tt.tag),
                label: labelData,
                bucket: result.bucketTransaction?.bucket || null,
            };
        },
    })
    /**
     * Create a transaction
     */
    .addQuery('create', {
        operation: 'Create a transaction',
        fn: async ({ data, userId }) => {
            const [newTransaction] = await db
                .insert(transaction)
                .values({
                    ...data,
                    userId,
                })
                .returning();

            return newTransaction;
        },
    })
    /**
     * Update a transaction by ID
     */
    .addQuery('updateById', {
        operation: 'Update a transaction',
        fn: async ({ ids, userId, data }) => {
            const [updatedTransaction] = await db
                .update(transaction)
                .set({
                    ...data,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(transaction.id, ids.id),
                        eq(transaction.userId, userId),
                        eq(transaction.isActive, true)
                    )
                )
                .returning();

            return updatedTransaction;
        },
    })
    /**
     * Remove a transaction by ID
     */
    .addQuery('removeById', {
        operation: 'Soft delete a transaction',
        fn: async ({ ids, userId }) => {
            const [deletedTransaction] = await db
                .update(transaction)
                .set({
                    isActive: false,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(transaction.id, ids.id),
                        eq(transaction.userId, userId),
                        eq(transaction.isActive, true)
                    )
                )
                .returning();

            return deletedTransaction;
        },
    });

// Legacy functions that may still be used elsewhere

/**
 * Get filter options for transaction table
 * @param userId - The user ID
 * @returns The filter options
 */
export const getFilterOptions = async (userId: string) => {
    // Get unique accounts
    const accounts = await db
        .selectDistinct({
            id: dbTable.connectedBankAccount.id,
            name: dbTable.connectedBankAccount.name,
            type: dbTable.connectedBankAccount.type,
        })
        .from(transaction)
        .innerJoin(
            dbTable.connectedBankAccount,
            eq(transaction.connectedBankAccountId, dbTable.connectedBankAccount.id)
        )
        .where(and(eq(transaction.userId, userId), eq(transaction.isActive, true)));

    // Get unique currencies
    const currencies = await db
        .select({
            currency: sql<string>`DISTINCT UNNEST(ARRAY[${transaction.spendingCurrency}, ${transaction.accountCurrency}])`,
        })
        .from(transaction)
        .where(and(eq(transaction.userId, userId), eq(transaction.isActive, true)));

    // Get unique labels
    const labels = await db
        .selectDistinct({
            id: dbTable.label.id,
            name: dbTable.label.name,
            color: dbTable.label.color,
        })
        .from(transaction)
        .innerJoin(dbTable.label, eq(transaction.labelId, dbTable.label.id))
        .where(and(eq(transaction.userId, userId), eq(transaction.isActive, true)));

    // Get user's tags
    const tags = await db.query.tag.findMany({
        where: and(eq(dbTable.tag.userId, userId), eq(dbTable.tag.isActive, true)),
        orderBy: [dbTable.tag.name],
    });

    return {
        accounts,
        currencies: currencies.map((c) => c.currency).filter(Boolean),
        labels,
        tags,
        types: ['transfer', 'credit', 'debit'] as const,
    };
};

/**
 * Get transactions by their keys (for duplicate detection)
 * @param userId - The user ID
 * @param keys - Array of transaction keys
 * @returns The transactions
 */
export const getByKeys = async ({ userId, keys }: { userId: string; keys: string[] }) => {
    if (keys.length === 0) return [];

    const result = await db.query.transaction.findMany({
        where: and(
            eq(transaction.userId, userId),
            eq(transaction.isActive, true),
            inArray(transaction.key, keys)
        ),
        columns: {
            id: true,
            key: true,
        },
    });

    return result;
};

/**
 * Get existing transactions based on a list of keys for duplicate checking.
 * @param userId - The user ID.
 * @param keys - An array of unique keys to check.
 * @returns A list of transactions that already exist.
 */
export const getDuplicates = async ({ userId, keys }: { userId: string; keys: string[] }) => {
    if (keys.length === 0) {
        return [];
    }

    const result = await db
        .select({
            id: transaction.id,
            key: transaction.key,
        })
        .from(transaction)
        .where(and(eq(transaction.userId, userId), inArray(transaction.key, keys)));

    return result;
};

/**
 * Create many transactions
 * @param data - The transaction data
 * @returns The created transactions
 */
export const createMany = async (data: Array<typeof transaction.$inferInsert>) => {
    const newTransactions = await db.insert(transaction).values(data).returning();
    return newTransactions;
};
