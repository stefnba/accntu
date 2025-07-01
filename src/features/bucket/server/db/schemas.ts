import { relations } from 'drizzle-orm';
import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { transaction } from '@/features/transaction/server/db/schema';
import { user } from '@/lib/auth/server/db/schema';
import { createId } from '@paralleldrive/cuid2';

export const bucketTypeEnum = pgEnum('bucket_type', ['trip', 'home', 'project', 'event', 'other']);

export const bucketStatusEnum = pgEnum('bucket_status', ['open', 'settled']);

export const bucket = pgTable('bucket', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    type: bucketTypeEnum('type').notNull().default('other'),
    status: bucketStatusEnum('status').notNull().default('open'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    isActive: boolean('is_active').notNull().default(true),
});

export const bucketParticipant = pgTable('bucket_participant', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    bucketId: text('bucket_id')
        .notNull()
        .references(() => bucket.id, { onDelete: 'cascade' }),
    // If the participant is an existing user of the app
    userId: text('user_id').references(() => user.id, {
        onDelete: 'set null',
    }),
    // Name for external participants not on the app
    name: text('name').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    isActive: boolean('is_active').notNull().default(true),
});

export const bucketsRelations = relations(bucket, ({ many, one }) => ({
    user: one(user, {
        fields: [bucket.userId],
        references: [user.id],
    }),
    participants: many(bucketParticipant),
    transactions: many(transaction),
}));

export const bucketParticipantsRelations = relations(bucketParticipant, ({ one }) => ({
    bucket: one(bucket, {
        fields: [bucketParticipant.bucketId],
        references: [bucket.id],
    }),
    user: one(user, {
        fields: [bucketParticipant.userId],
        references: [user.id],
    }),
}));

// Zod schemas
export const selectBucketSchema = createSelectSchema(bucket);
export const insertBucketSchema = createInsertSchema(bucket, {
    title: z.string().min(1, 'Title is required'),
}).omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    isActive: true,
});
export const updateBucketSchema = insertBucketSchema.partial();

export const selectBucketParticipantSchema = createSelectSchema(bucketParticipant);
export const insertBucketParticipantSchema = createInsertSchema(bucketParticipant, {
    name: z.string().min(1, 'Name is required'),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    isActive: true,
});
export const updateBucketParticipantSchema = insertBucketParticipantSchema.partial();
