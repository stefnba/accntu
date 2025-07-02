import {
    EmailProvider,
    EmailSendProviderResponse,
    SendEmailOptions,
} from '@/server/lib/email/core/types';
import { Resend } from 'resend';
import { z } from 'zod';

export const resendConfigSchema = z.object({
    apiKey: z.string(),
});
export type TResendProviderConfig = z.infer<typeof resendConfigSchema>;

/**
 * ## Resend Provider
 *
 * The recommended provider for production environments. It offers a reliable
 * service and a great developer experience.
 *
 * @see https://resend.com/docs
 */
export class ResendProvider implements EmailProvider {
    readonly name = 'resend';
    private client: Resend;
    private config: TResendProviderConfig;

    constructor(config: TResendProviderConfig) {
        this.config = config;
        this.client = new Resend(this.config.apiKey);
    }

    /**
     * Sends an email using the Resend API.
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

        try {
            const response = await this.client.emails.send({
                to,
                from,
                subject: options.subject,
                html: options.html,
                text: options.text,
                replyTo,
                tags: Object.entries(options.tags || {}).map(([name, value]) => ({ name, value })),
            });

            if (response.error) {
                return {
                    success: false,
                    error: response.error.message,
                    providerMessageId: '',
                    provider: this.name,
                };
            }

            return {
                success: true,
                providerMessageId: response.data?.id ?? '',
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
