import { connectedBankAccount } from '@/features/bank/server/db/schemas';
import { label } from '@/features/label/server/db/schema';
import { tag, transactionTag } from '@/features/tag/server/db/schema';
import {
    TTransactionFilterOptions,
    TTransactionPagination,
    TTransactionQuery,
} from '@/features/transaction/schemas';
import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, count, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import { transaction } from './schema';

const getAll = async ({
    userId,
    filters,
    pagination,
}: TQuerySelectUserRecords<TTransactionFilterOptions> & { pagination: TTransactionPagination }) =>
    withDbQuery({
        operation: 'Get paginated transactions with filters and relations',
        queryFn: async () => {
            const offset = (pagination?.page - 1) * pagination?.pageSize;

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
                },
                orderBy: [desc(transaction.date), desc(transaction.createdAt)],
                limit: pagination?.pageSize,
                offset,
            });

            // Get tags for transactions (separate query for optimization)
            const transactionIds = transactions.map((t) => t.id);
            const transactionTagsData =
                transactionIds.length > 0
                    ? await db.query.transactionTag.findMany({
                          where: inArray(transactionTag.transactionId, transactionIds),
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
                          where: inArray(label.id, labelIds),
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
            }));

            return {
                transactions: transactionsWithRelations,
                totalCount,
                pagination: {
                    page: pagination?.page,
                    pageSize: pagination?.pageSize,
                    totalCount,
                    totalPages: Math.ceil(totalCount / pagination?.pageSize),
                },
            };
        },
    });

/**
 * Get a transaction by ID
 * @param userId - The user ID
 * @param id - The transaction ID
 * @returns The transaction
 */
export const getById = async ({ userId, id }: TQuerySelectUserRecordById) =>
    withDbQuery({
        operation: 'Get single transaction by ID with relations',
        queryFn: async () => {
            const result = await db.query.transaction.findFirst({
                where: and(
                    eq(transaction.id, id),
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
                },
            });

            if (!result) {
                return null;
            }

            // Get tags for this transaction
            const transactionTagsData = await db.query.transactionTag.findMany({
                where: eq(transactionTag.transactionId, id),
                with: {
                    tag: true,
                },
            });

            // Get label for this transaction
            const labelData = result.labelId
                ? await db.query.label.findFirst({
                      where: eq(label.id, result.labelId),
                  })
                : null;

            return {
                ...result,
                tags: transactionTagsData.map((tt) => tt.tag),
                label: labelData,
            };
        },
    });

/**
 * Get filter options for transaction table
 * @param userId - The user ID
 * @returns The filter options
 */
export const getFilterOptions = async (userId: string) =>
    withDbQuery({
        operation: 'Get filter options for transaction table',
        queryFn: async () => {
            // Get unique accounts
            const accounts = await db
                .selectDistinct({
                    id: connectedBankAccount.id,
                    name: connectedBankAccount.name,
                    type: connectedBankAccount.type,
                })
                .from(transaction)
                .innerJoin(
                    connectedBankAccount,
                    eq(transaction.connectedBankAccountId, connectedBankAccount.id)
                )
                .where(and(eq(transaction.userId, userId), eq(transaction.isActive, true)));

            // Get unique currencies
            const currencies = await db
                .select({
                    currency: sql<string>`DISTINCT UNNEST(ARRAY[${transaction.spendingCurrency}, ${transaction.accountCurrency}])`,
                })
                .from(transaction)
                .where(and(eq(transaction.userId, userId), eq(transaction.isActive, true)));

            // Get user's labels
            const labels = await db.query.label.findMany({
                where: and(eq(label.userId, userId), eq(label.isDeleted, false)),
                orderBy: [label.name],
            });

            // Get user's tags
            const tags = await db.query.tag.findMany({
                where: and(eq(tag.userId, userId), eq(tag.isActive, true)),
                orderBy: [tag.name],
            });

            return {
                accounts,
                currencies: currencies.map((c) => c.currency).filter(Boolean),
                labels,
                tags,
                types: ['transfer', 'credit', 'debit'] as const,
            };
        },
    });

/**
 * Create many transactions
 * @param data - The transaction data
 * @returns The created transactions
 */
const createMany = async (data: Array<TTransactionQuery['insert']>) =>
    withDbQuery({
        operation: 'Create many transactions',
        queryFn: async () => {
            const newTransactions = await db.insert(transaction).values(data).returning();

            return newTransactions;
        },
    });

/**
 * Create a new transaction
 * @param data - The transaction data
 * @param userId - The user ID
 * @returns The created transaction
 */
const create = async ({ data, userId }: TQueryInsertUserRecord<TTransactionQuery['insert']>) =>
    withDbQuery({
        operation: 'Create a new transaction',
        queryFn: async () => {
            const [newTransaction] = await db
                .insert(transaction)
                .values({
                    ...data,
                    userId,
                })
                .returning();

            return newTransaction;
        },
    });

/**
 * Update a transaction
 * @param data - The transaction data
 * @param userId - The user ID
 * @returns The updated transaction
 */
export const update = async ({
    id,
    userId,
    data,
}: TQueryUpdateUserRecord<TTransactionQuery['update']>) =>
    withDbQuery({
        operation: 'Update a transaction',
        queryFn: async () => {
            const [updatedTransaction] = await db
                .update(transaction)
                .set({
                    ...data,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(transaction.id, id),
                        eq(transaction.userId, userId),
                        eq(transaction.isActive, true)
                    )
                )
                .returning();

            return updatedTransaction;
        },
    });

/**
 * Soft delete a transaction
 */
export const remove = async ({ id, userId }: TQueryDeleteUserRecord) =>
    withDbQuery({
        operation: 'Soft delete a transaction',
        queryFn: async () => {
            const [deletedTransaction] = await db
                .update(transaction)
                .set({
                    isActive: false,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(transaction.id, id),
                        eq(transaction.userId, userId),
                        eq(transaction.isActive, true)
                    )
                )
                .returning();

            return deletedTransaction;
        },
    });

/**
 * Get transactions by their keys (for duplicate detection)
 * @param userId - The user ID
 * @param keys - Array of transaction keys
 * @returns The transactions
 */
export const getByKeys = async ({ userId, keys }: { userId: string; keys: string[] }) =>
    withDbQuery({
        operation: 'Get transactions by keys',
        queryFn: async () => {
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
        },
    });

export const transactionQueries = {
    getAll,
    getById,
    getByKeys,
    getFilterOptions,
    create,
    createMany,
    update,
    remove,
};
