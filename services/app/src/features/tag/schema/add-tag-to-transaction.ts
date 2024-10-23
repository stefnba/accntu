import { z } from 'zod';

export const AddTagToTransactionSchema = z.object({
    tagId: z.string().optional(),
    transactionId: z.string(),
    name: z.string().optional()
});

export type TAddTagToTransactionValues = z.input<
    typeof AddTagToTransactionSchema
>;
