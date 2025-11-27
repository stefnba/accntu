import { participant } from '@/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import z from 'zod';

const optionalEmail = z
    .string()
    .optional()
    .transform((val) => (val === '' || !val ? undefined : val))
    .refine((val) => !val || z.email().safeParse(val).success, {
        message: 'Invalid email format',
    });

export const participantTableConfig = createFeatureTableConfig(participant)
    .transform((base) =>
        base.extend({ email: optionalEmail, name: z.string().min(1, 'Name cannot be empty') })
    )
    .restrictUpsertFields(['name', 'email'])
    .enableFiltering({
        search: z.string().optional(),
    })
    .enablePagination()
    .setUserId('userId')
    .build();
