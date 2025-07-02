import { z } from 'zod';

/**
 * Validation schema for email addresses
 * 
 * @example
 * ```typescript
 * const address = EmailAddressSchema.parse({
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * });
 * ```
 */
export const EmailAddressSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
});

/**
 * Validation schema for email attachments
 * 
 * @example
 * ```typescript
 * const attachment = EmailAttachmentSchema.parse({
 *   filename: 'document.pdf',
 *   content: pdfBuffer,
 *   contentType: 'application/pdf'
 * });
 * ```
 */
export const EmailAttachmentSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  content: z.union([z.string(), z.instanceof(Buffer)]),
  contentType: z.string().optional(),
  encoding: z.string().optional(),
});

export const SendEmailSchema = z.object({
  to: z.union([EmailAddressSchema, z.array(EmailAddressSchema)]),
  from: EmailAddressSchema.optional(),
  replyTo: EmailAddressSchema.optional(),
  subject: z.string().min(1, 'Subject is required').max(998, 'Subject too long'),
  html: z.string().min(1, 'HTML content is required'),
  text: z.string().min(1, 'Text content is required'),
  attachments: z.array(EmailAttachmentSchema).optional(),
  tags: z.record(z.string()).optional(),
  headers: z.record(z.string()).optional(),
});

export const TemplateDataSchema = z.record(
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({}),
    z.null(),
    z.undefined(),
  ])
);

export const EmailTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject key is required'),
  locale: z.string().default('en'),
  data: TemplateDataSchema,
});

export const SendTemplatedEmailSchema = z.object({
  to: z.union([EmailAddressSchema, z.array(EmailAddressSchema)]),
  template: EmailTemplateSchema,
  from: EmailAddressSchema.optional(),
  replyTo: EmailAddressSchema.optional(),
  tags: z.record(z.string()).optional(),
  headers: z.record(z.string()).optional(),
});

/**
 * Validation schema for OTP email data
 * 
 * @example
 * ```typescript
 * const otpData = OTPEmailSchema.parse({
 *   user: { name: 'John Doe', email: 'john@example.com' },
 *   otpCode: '123456',
 *   locale: 'en'
 * });
 * ```
 */
export const OTPEmailSchema = z.object({
  user: z.object({
    name: z.string().min(1, 'User name is required'),
    email: z.string().email('Invalid email address'),
  }),
  otpCode: z.string().min(4, 'OTP code must be at least 4 characters').max(10, 'OTP code too long'),
  locale: z.string().default('en'),
});

export const WelcomeEmailSchema = z.object({
  user: z.object({
    name: z.string().min(1, 'User name is required'),
    email: z.string().email('Invalid email address'),
  }),
  locale: z.string().default('en'),
});

export const PasswordResetEmailSchema = z.object({
  user: z.object({
    name: z.string().min(1, 'User name is required'),
    email: z.string().email('Invalid email address'),
  }),
  resetLink: z.string().url('Invalid reset link URL'),
  locale: z.string().default('en'),
});

export const TransactionNotificationEmailSchema = z.object({
  user: z.object({
    name: z.string().min(1, 'User name is required'),
    email: z.string().email('Invalid email address'),
  }),
  transaction: z.object({
    amount: z.number(),
    description: z.string().min(1, 'Transaction description is required'),
    date: z.string(),
  }),
  locale: z.string().default('en'),
});

/**
 * Validation schema for email provider configuration
 * 
 * @example
 * ```typescript
 * // Resend configuration
 * const config = EmailProviderConfigSchema.parse({
 *   provider: 'resend',
 *   resend: { apiKey: 're_your_api_key' },
 *   from: { email: 'noreply@example.com', name: 'App Name' }
 * });
 * 
 * // Mailtrap configuration
 * const devConfig = EmailProviderConfigSchema.parse({
 *   provider: 'mailtrap',
 *   mailtrap: {
 *     host: 'sandbox.smtp.mailtrap.io',
 *     port: 2525,
 *     username: 'your-username',
 *     password: 'your-password'
 *   },
 *   from: { email: 'test@example.com' }
 * });
 * ```
 */
export const EmailProviderConfigSchema = z.object({
  provider: z.enum(['resend', 'smtp', 'mailtrap']),
  resend: z.object({
    apiKey: z.string().min(1, 'Resend API key is required'),
  }).optional(),
  smtp: z.object({
    host: z.string().min(1, 'SMTP host is required'),
    port: z.number().int().min(1).max(65535),
    username: z.string().optional(),
    password: z.string().optional(),
    secure: z.boolean().optional(),
  }).optional(),
  mailtrap: z.object({
    host: z.string().min(1, 'Mailtrap host is required'),
    port: z.number().int().min(1).max(65535),
    username: z.string().min(1, 'Mailtrap username is required'),
    password: z.string().min(1, 'Mailtrap password is required'),
  }).optional(),
  from: EmailAddressSchema,
  replyTo: EmailAddressSchema.optional(),
});

export type EmailAddress = z.infer<typeof EmailAddressSchema>;
export type EmailAttachment = z.infer<typeof EmailAttachmentSchema>;
export type SendEmailData = z.infer<typeof SendEmailSchema>;
export type EmailTemplateData = z.infer<typeof EmailTemplateSchema>;
export type SendTemplatedEmailData = z.infer<typeof SendTemplatedEmailSchema>;
export type OTPEmailData = z.infer<typeof OTPEmailSchema>;
export type WelcomeEmailData = z.infer<typeof WelcomeEmailSchema>;
export type PasswordResetEmailData = z.infer<typeof PasswordResetEmailSchema>;
export type TransactionNotificationEmailData = z.infer<typeof TransactionNotificationEmailSchema>;
export type EmailProviderConfigData = z.infer<typeof EmailProviderConfigSchema>;