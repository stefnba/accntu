import { z } from 'zod';

export const TestSchema = z.object({
    name: z.string({
        invalid_type_error: 'Name must be a string'
    })
});
