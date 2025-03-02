import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string(),
    email: z.string(),
    lastName: z.string().nullable(),
    firstName: z.string().nullable(),
});

export type User = z.infer<typeof UserSchema>;

export const SessionSchema = z.object({
    id: z.string(),
    expiresAt: z.date(),
});

export type Session = z.infer<typeof SessionSchema>;

export const OTPVerifySchema = z.object({
    code: z.string().length(8),
});
export type OTPVerify = z.infer<typeof OTPVerifySchema>;
