import { z } from 'zod';

const a = {
    label: [12, 2],
    account: [12, 3]
};

export const FilterOptionsSchema = z.object({
    filterKey: z.union([
        z.literal('label'),
        z.literal('account'),
        z.literal('title')
    ])
});

type A = z.infer<typeof FilterOptionsSchema>;
