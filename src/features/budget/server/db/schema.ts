import { relations } from 'drizzle-orm';
import {
    boolean,
    decimal,
    index,
    json,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

import { participant } from '@/features/participant/server/db/tables';
import { transaction } from '@/features/transaction/server/db/schema';
import { user } from '@/lib/auth/server/db/schema';
import { createId } from '@paralleldrive/cuid2';

// ====================
// Enums
// ====================

export const splitSourceEnum = pgEnum('split_source', [
    'transaction', // Direct transaction split
    'bucket', // Bucket-level default
    'account', // Account-level default
    'none', // No splits configured, 100% to user
]);

// ====================
// Tables
// ====================

export const transactionBudget = pgTable(
    'transaction_budget',
    {
        id: text()
            .primaryKey()
            .$defaultFn(() => createId()),
        transactionId: text()
            .notNull()
            .references(() => transaction.id, { onDelete: 'cascade' }),
        userId: text()
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),

        // User's computed budget amount (what this user pays)
        budgetAmount: decimal({ precision: 12, scale: 2 }).notNull(),
        budgetPercentage: decimal({ precision: 5, scale: 2 }).notNull(), // What % of transaction this user pays

        // Split calculation metadata
        splitSource: splitSourceEnum().notNull(),

        // Recalculation tracking
        calculatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
        isRecalculationNeeded: boolean().notNull().default(false),

        // Standard audit fields
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
        isActive: boolean().notNull().default(true),
    },
    (table) => [
        // One budget record per transaction per user
        uniqueIndex('transaction_budget_transaction_user_unique').on(
            table.transactionId,
            table.userId,
            table.isActive
        ),
        // Index for user budget queries
        index('transaction_budget_user_idx').on(table.userId),
        // Index for transaction queries
        index('transaction_budget_transaction_idx').on(table.transactionId),
        // Index for recalculation queries
        index('transaction_budget_recalc_needed_idx').on(table.isRecalculationNeeded),
    ]
);

export const transactionBudgetToParticipant = pgTable(
    'transaction_budget_to_participant',
    {
        id: text()
            .primaryKey()
            .$defaultFn(() => createId()),
        transactionBudgetId: text()
            .notNull()
            .references(() => transactionBudget.id, { onDelete: 'cascade' }),
        participantId: text()
            .notNull()
            .references(() => participant.id, { onDelete: 'cascade' }),

        // Resolved amounts for this participant
        resolvedAmount: decimal({ precision: 12, scale: 2 }).notNull(),
        resolvedPercentage: decimal({ precision: 5, scale: 2 }).notNull(),

        // Snapshot of split config used for this calculation
        splitConfigUsed: json().notNull(),

        // Marks which participant record belongs to the budget owner
        isUserParticipant: boolean().notNull().default(false),

        // Standard audit fields
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        // One record per budget per participant
        uniqueIndex('transaction_budget_to_participant_unique').on(
            table.transactionBudgetId,
            table.participantId
        ),
        // Index for participant queries
        index('transaction_budget_to_participant_participant_idx').on(table.participantId),
        // Index for budget queries
        index('transaction_budget_to_participant_budget_idx').on(table.transactionBudgetId),
        // Index for user participant queries
        index('transaction_budget_to_participant_user_idx').on(table.isUserParticipant),
    ]
);

// ====================
// Relations
// ====================

export const transactionBudgetRelations = relations(transactionBudget, ({ one, many }) => ({
    transaction: one(transaction, {
        fields: [transactionBudget.transactionId],
        references: [transaction.id],
    }),
    user: one(user, {
        fields: [transactionBudget.userId],
        references: [user.id],
    }),
    participants: many(transactionBudgetToParticipant),
}));

export const transactionBudgetToParticipantRelations = relations(
    transactionBudgetToParticipant,
    ({ one }) => ({
        transactionBudget: one(transactionBudget, {
            fields: [transactionBudgetToParticipant.transactionBudgetId],
            references: [transactionBudget.id],
        }),
        participant: one(participant, {
            fields: [transactionBudgetToParticipant.participantId],
            references: [participant.id],
        }),
    })
);

// ====================
// Base Zod schemas
// ====================

export const selectTransactionBudgetSchema = createSelectSchema(transactionBudget);
export const insertTransactionBudgetSchema = createInsertSchema(transactionBudget);
export const updateTransactionBudgetSchema = createUpdateSchema(transactionBudget);

export const selectTransactionBudgetToParticipantSchema = createSelectSchema(
    transactionBudgetToParticipant
);
export const insertTransactionBudgetToParticipantSchema = createInsertSchema(
    transactionBudgetToParticipant
);
export const updateTransactionBudgetToParticipantSchema = createUpdateSchema(
    transactionBudgetToParticipant
);
