import { createFormSchema } from '@/hooks/use-form';
import { z } from 'zod';

export const loginEmailSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

export const loginEmailFormSchema = createFormSchema(loginEmailSchema, {
    email: '',
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
