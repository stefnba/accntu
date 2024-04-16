import { TransactionType } from '@prisma/client';
import { z } from 'zod';

export const CreateLabelSchema = z.object({
    name: z.string(),
    parentLabelId: z.string().optional()
});
