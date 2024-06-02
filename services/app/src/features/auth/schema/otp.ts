import { EMAIL_OTP_LOGIN } from '@auth/config';
import * as z from 'zod';

export const SendOTPSchema = z.object({
    email: z.string().email().min(1, 'Email is required')
});

export const VerifyOTPSchema = z.object({
    code: z.string().length(EMAIL_OTP_LOGIN.CODE_LENGTH, 'Invalid code')
});
