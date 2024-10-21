import { z } from 'zod';

export const GetTagToTransactionSchema = z.object({
    tagId: z.string(),
    transactionId: z.string()
});

export type TGetTagToTransactionValues = z.infer<
    typeof GetTagToTransactionSchema
>;
