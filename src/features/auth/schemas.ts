import { createFormSchema } from '@/hooks/use-form';
import { OTPVerifySchema } from '@/server/features/auth/schemas';
import { z } from 'zod';

export { OTPVerifySchema };

export const OTPVerifyFormSchema = createFormSchema(OTPVerifySchema, {
    code: '',
});

export const loginEmailSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

export const loginEmailFormSchema = createFormSchema(loginEmailSchema, {
    email: 's2@s2.com',
});

export const signupEmailSchema = loginEmailSchema.extend({
    name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const signupEmailFormSchema = createFormSchema(signupEmailSchema, {
    name: '',
    email: '',
});

export const loginWithSocialSchema = z.object({
    provider: z.enum(['github', 'google', 'apple']),
});
export type SocialProvider = z.infer<typeof loginWithSocialSchema>['provider'];
export type LoginMethod = 'email' | SocialProvider;
