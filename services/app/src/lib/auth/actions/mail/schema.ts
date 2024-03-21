import * as z from 'zod';

import { CODE_LENGTH } from './config';

export const SendTokenSchema = z.object({
    email: z.coerce.string().email().min(1, 'Email is required')
});

export const VerifyTokenSchema = z.object({
    code: z.string().length(CODE_LENGTH)
});
