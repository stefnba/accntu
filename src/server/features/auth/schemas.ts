import { AuthProviderSchema } from '@/server/db/schemas/auth';
import { z } from 'zod';

export const EmailLoginSchema = z.object({
    email: z.string().email(),
});

export type EmailLogin = z.infer<typeof EmailLoginSchema>;

export const OTPVerifySchema = z.object({
    code: z.coerce.string().length(8),
});
export type OTPVerify = z.infer<typeof OTPVerifySchema>;

export const SignupSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2).max(100),
});

export const SocialLoginSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    provider: AuthProviderSchema,
});
