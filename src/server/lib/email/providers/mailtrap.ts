import { EmailProvider, EmailSendResponse, SendEmailOptions } from '@/server/lib/email/core/types';
import { createTransport, type Transporter } from 'nodemailer';
import { z } from 'zod';

export const mailTrapConfigSchema = z.object({
    host: z.string(),
    port: z.number(),
    username: z.string(),
    password: z.string(),
});
export type TMailtrapProviderConfig = z.infer<typeof mailTrapConfigSchema>;

/**
 * ## Mailtrap Provider
 *
 * The recommended provider for development and testing. It captures emails in a
 * virtual inbox, preventing you from spamming real users during development.
 *
 * @see https://mailtrap.io
 */
export class MailtrapProvider implements EmailProvider {
    readonly name = 'mailtrap';
    private client: Transporter;
    private config: TMailtrapProviderConfig;

    constructor(config: TMailtrapProviderConfig) {
        this.config = config;
        this.client = createTransport({
            host: this.config.host,
            port: this.config.port,
            auth: {
                user: this.config.username,
                pass: this.config.password,
            },
        });
    }

    /**
     * Sends an email using Nodemailer configured for Mailtrap.
     */
    async sendEmail(options: SendEmailOptions): Promise<EmailSendResponse> {
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
            return { success: true, id: result.messageId };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMessage, id: '' };
        }
    }

    /**
     * Gets the Mailtrap inbox URL for viewing captured emails
     *
     * @returns {string} URL to access Mailtrap inbox (if host is recognized Mailtrap domain)
     */
    getInboxUrl(): string {
        if (this.config.host?.includes('mailtrap.io')) {
            return 'https://mailtrap.io/inboxes';
        }
        return 'Check your Mailtrap dashboard for captured emails';
    }

    /**
     * Verifies connection to Mailtrap server
     *
     * @returns {Promise<boolean>} True if connection successful, false otherwise
     */
    async verifyConnection(): Promise<boolean> {
        try {
            await this.client.verify();
            return true;
        } catch (error) {
            console.error('Mailtrap connection verification failed:', error);
            return false;
        }
    }
}
