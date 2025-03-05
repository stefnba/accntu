import { z } from 'zod';

export const EmailLoginSchema = z.object({
    email: z.string().email(),
});

export type EmailLogin = z.infer<typeof EmailLoginSchema>;

export const SessionSchema = z.object({
    id: z.string(),
    expiresAt: z.date(),
});

export type Session = z.infer<typeof SessionSchema>;

export const OTPVerifySchema = z.object({
    code: z.coerce.string().length(8),
});
export type OTPVerify = z.infer<typeof OTPVerifySchema>;
