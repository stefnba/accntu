import {
    insertbucketTransactionSchema,
    selectbucketTransactionSchema,
    updatebucketTransactionSchema,
} from '@/features/bucket/server/db/schemas';
import { z } from 'zod';

// Query schemas for internal use
export const bucketTransactionQuerySchemas = {
    select: selectbucketTransactionSchema,
    insert: insertbucketTransactionSchema,
    update: updatebucketTransactionSchema,
} as const;

// API schemas for client-server communication
export const assignTransactionToBucketSchema = z.object({
    bucketId: z.string().min(1, 'Bucket ID is required'),
    notes: z.string().optional(),
});

export const reassignTransactionToBucketSchema = z.object({
    newBucketId: z.string().min(1, 'New bucket ID is required'),
    notes: z.string().optional(),
});

export const updateSplitWiseStatusSchema = z.object({
    isRecorded: z.boolean(),
});

export const updatePaidAmountSchema = z.object({
    paidAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
});

// Type exports
export type TbucketTransactionQuery = {
    select: z.infer<typeof selectbucketTransactionSchema>;
    insert: z.infer<typeof insertbucketTransactionSchema>;
    update: z.infer<typeof updatebucketTransactionSchema>;
};

export type TAssignTransactionToBucket = z.infer<typeof assignTransactionToBucketSchema>;
export type TReassignTransactionToBucket = z.infer<typeof reassignTransactionToBucketSchema>;
export type TUpdateSplitWiseStatus = z.infer<typeof updateSplitWiseStatusSchema>;
export type TUpdatePaidAmount = z.infer<typeof updatePaidAmountSchema>;
