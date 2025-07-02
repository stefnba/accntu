import { createEmailConfig } from '@/server/lib/email';
import { z } from 'zod';

/**
 * ## Welcome Email Template
 *
 * Sent to users upon their first sign-in or sign-up.
 *
 * - **Category:** `authentication`
 * - **Data:** `{ user: { name: string, email: string } }`
 */
export const welcomeEmailConfig = createEmailConfig({
    id: 'auth-welcome',
    templatePath: 'features/auth/email/templates/welcome.njk',
    subjectKey: 'auth.welcome_subject',
    category: 'authentication',
    description: 'Email sent to new users upon registration.',
    schema: z.object({
        user: z.object({
            name: z.string().min(1, 'User name is required.'),
            email: z.string().email('Invalid email address.'),
        }),
    }),
});

/**
 * ## One-Time Password (OTP) Email Template
 *
 * Used for sending login verification codes.
 *
 * - **Category:** `authentication`
 * - **Data:** `{ user: { name: string }, otpCode: string }`
 */
export const otpEmailConfig = createEmailConfig({
    id: 'auth-otp',
    templatePath: 'features/auth/email/templates/otp.njk',
    subjectKey: 'auth.otp_subject',
    category: 'authentication',
    description: 'Email for sending one-time password for login verification.',
    schema: z.object({
        user: z.object({
            name: z.string().min(1, 'User name is required.'),
        }),
        otpCode: z.string().min(6, 'OTP code must be at least 6 characters.'),
    }),
});
