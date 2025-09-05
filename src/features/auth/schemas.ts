import { z } from 'zod';

export const loginEmailFormSchema = z.object({
    email: z.email('Invalid email address.'),
});
export type TLoginEmailFormSchema = z.infer<typeof loginEmailFormSchema>;

export const signupEmailFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.email('Invalid email address.'),
});
export type TSignupEmailFormSchema = z.infer<typeof signupEmailFormSchema>;

export const emailOTPVerifySchema = z.object({
    code: z.string().length(8, 'Code must be exactly 8 digits.'),
});
export type TEmailOTPVerifySchema = z.infer<typeof emailOTPVerifySchema>;
