import {
    EmailProvider,
    EmailSendProviderResponse,
    SendEmailOptions,
} from '@/server/lib/email/core/types';
import { createTransport, type Transporter } from 'nodemailer';
import { z } from 'zod';

export const smtpConfigSchema = z.object({
    host: z.string(),
    port: z.number(),
    username: z.string().optional(),
    password: z.string().optional(),
    secure: z.boolean().optional(),
});
export type TSMTPProviderConfig = z.infer<typeof smtpConfigSchema>;

/**
 * ## SMTP Provider
 *
 * A generic provider for sending emails through a standard SMTP server. Useful
 * for a wide range of email services.
 */
export class SMTPProvider implements EmailProvider {
    readonly name = 'smtp';
    private client: Transporter;
    private config: TSMTPProviderConfig;

    constructor(config: TSMTPProviderConfig) {
        this.config = config;
        this.client = createTransport({
            host: this.config.host,
            port: this.config.port,
            secure: this.config.secure,
            auth: {
                user: this.config.username,
                pass: this.config.password,
            },
        });
    }

    /**
     * Sends an email using Nodemailer with the configured SMTP settings.
     */
    async sendEmail(options: SendEmailOptions): Promise<EmailSendProviderResponse> {
        const from = options.from.name
            ? `${options.from.name} <${options.from.email}>`
            : options.from.email;

        const to = Array.isArray(options.to)
            ? options.to.map((addr) => (addr.name ? `${addr.name} <${addr.email}>` : addr.email))
            : options.to.name
              ? `${options.to.name} <${options.to.email}>`
              : options.to.email;

        const replyTo = options.replyTo
            ? options.replyTo.name
                ? `${options.replyTo.name} <${options.replyTo.email}>`
                : options.replyTo.email
            : undefined;

        const mailOptions = {
            from,
            to,
            subject: options.subject,
            html: options.html,
            text: options.text,
            replyTo,
        };

        try {
            const result = await this.client.sendMail(mailOptions);
            return {
                success: true,
                providerMessageId: result.messageId,
                provider: this.name,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: errorMessage,
                providerMessageId: '',
                provider: this.name,
            };
        }
    }
}
