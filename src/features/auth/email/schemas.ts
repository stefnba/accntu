import { z } from 'zod';

/**
 * Schema for OTP email data
 */
export const OTPEmailDataSchema = z.object({
  user: z.object({
    name: z.string().min(1, 'User name is required'),
    email: z.string().email('Invalid email address'),
  }),
  otpCode: z.string().min(4, 'OTP code must be at least 4 characters').max(10, 'OTP code too long'),
  expirationMinutes: z.number().default(10),
});

/**
 * Schema for welcome email data
 */
export const WelcomeEmailDataSchema = z.object({
  user: z.object({
    name: z.string().min(1, 'User name is required'),
    email: z.string().email('Invalid email address'),
  }),
  gettingStartedSteps: z.array(z.string()).optional(),
});

/**
 * Schema for password reset email data
 */
export const PasswordResetEmailDataSchema = z.object({
  user: z.object({
    name: z.string().min(1, 'User name is required'),
    email: z.string().email('Invalid email address'),
  }),
  resetLink: z.string().url('Invalid reset link URL'),
  expirationHours: z.number().default(1),
});

/**
 * Type exports for use in template configurations
 */
export type OTPEmailData = z.infer<typeof OTPEmailDataSchema>;
export type WelcomeEmailData = z.infer<typeof WelcomeEmailDataSchema>;
export type PasswordResetEmailData = z.infer<typeof PasswordResetEmailDataSchema>;