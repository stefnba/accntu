# Email Service

A robust, modular, and type-safe email service for sending transactional and templated emails.

This new architecture is designed around a decentralized, class-based approach to email templates, ensuring that each email type is self-contained and fully type-safe from end to end. It uses a provider-based system, making it easy to switch between different email services like Resend, SMTP, or Mailtrap.

## Key Features

- **Type-Safe by Design**: Leverages Zod schemas and TypeScript generics to ensure that you can't send an email with an invalid data payload. The `createSender` method generates a strongly-typed function for each email template.
- **Decentralized Templates**: No more central registry. Each email template is an `EmailConfig` class, co-located with its related feature logic.
- **Provider-Based Architecture**: Easily switch between email providers (Resend, SMTP, Mailtrap) through environment variables. Adding a new provider is straightforward.
- **Automatic CSS Inlining**: Uses `juice` to automatically inline a global CSS file into your HTML templates for maximum email client compatibility.
- **Internationalization (i18n)**: Built-in support for multiple locales using `i18n`. Template subjects and content can be easily translated.

## Quick Start

### 1. Create the Email Service

The service should be instantiated once and shared across your application. The recommended way to do this is with the `createEmailServiceFromEnv` factory, which reads your environment variables to configure the correct provider.

```typescript
// src/server/lib/email/index.ts (or a central service registry)
import { createEmailServiceFromEnv } from '@/server/lib/email';

export const emailService = createEmailServiceFromEnv();
```

### 2. Define an Email Template

Create a new class that extends `EmailConfig`. This class defines the email's unique ID, its Nunjucks template path, its subject line key for i18n, and a Zod schema for its data payload.

**Example: `WelcomeEmail.ts`**

```typescript
import { z } from 'zod';
import { EmailConfig, TMailCategory } from '@/server/lib/email';

export class WelcomeEmail extends EmailConfig {
    readonly id = 'welcome';
    readonly templatePath = 'features/auth/email/templates/welcome.njk';
    readonly subjectKey = 'auth.welcome_subject';
    readonly schema = z.object({
        user: z.object({
            name: z.string(),
        }),
    });
    readonly category: TMailCategory = 'authentication';
    readonly description = 'Email sent to new users upon registration.';
}
```

### 3. Create a Type-Safe Sender

Use the `emailService.createSender()` method with your new template class. This creates a reusable, type-safe function for sending that specific email.

```typescript
import { emailService } from '@/server/lib/email';
import { WelcomeEmail } from './WelcomeEmail';

export const sendWelcomeEmail = emailService.createSender(WelcomeEmail);
```

### 4. Send the Email

Call your new sender function with the recipient's address and the data payload. TypeScript will enforce that the `data` object matches the Zod schema you defined in `WelcomeEmail`.

```typescript
await sendWelcomeEmail({
    to: { email: 'new-user@example.com', name: 'Jane Doe' },
    data: {
        user: {
            name: 'Jane Doe',
        },
    },
});
```

## Configuration (Environment Variables)

The `createEmailServiceFromEnv` factory is configured via the following environment variables:

| Variable             | Description                                               | Default    |
| -------------------- | --------------------------------------------------------- | ---------- |
| `EMAIL_PROVIDER`     | The email provider to use (`resend`, `smtp`, `mailtrap`). | `resend`   |
| `EMAIL_FROM_ADDRESS` | The "from" email address for all outgoing mail.           | _Required_ |
| `EMAIL_FROM_NAME`    | The "from" name for all outgoing mail.                    | `Accntu`   |

### Resend

Set `EMAIL_PROVIDER=resend`.

| Variable         | Description          |
| ---------------- | -------------------- |
| `RESEND_API_KEY` | Your Resend API key. |

### SMTP

Set `EMAIL_PROVIDER=smtp`.

| Variable      | Description                           |
| ------------- | ------------------------------------- |
| `SMTP_HOST`   | The SMTP server hostname.             |
| `SMTP_PORT`   | The SMTP server port.                 |
| `SMTP_USER`   | The username for SMTP authentication. |
| `SMTP_PASS`   | The password for SMTP authentication. |
| `SMTP_SECURE` | Whether to use a secure connection.   |

### Mailtrap (for Development)

Set `EMAIL_PROVIDER=mailtrap`.

| Variable        | Description                  |
| --------------- | ---------------------------- |
| `MAILTRAP_HOST` | Your Mailtrap SMTP host.     |
| `MAILTRAP_PORT` | Your Mailtrap SMTP port.     |
| `MAILTRAP_USER` | Your Mailtrap SMTP username. |
| `MAILTRAP_PASS` | Your Mailtrap SMTP password. |

## Previewing Emails

During development, you can preview how an email will look without actually sending it by using the `emailService.preview()` method.

```typescript
const { subject, html, text } = await emailService.preview(new WelcomeEmail(), {
    to: { email: 'test@example.com' },
    data: { user: { name: 'Test User' } },
});

console.log('Subject:', subject);
console.log('HTML Body:', html);
```

## Testing with the Mailtrap Example

To quickly test your setup, we've included a standalone example.

1.  **Configure Mailtrap**: Make sure your `.env` file has the `MAILTRAP_*` variables set.
2.  **Run the test script**:
    ```bash
    bun run src/server/lib/email/example.ts
    ```
3.  **Check Your Inbox**: Open your Mailtrap inbox. You should see a "Hello from Accntu!" email waiting for you.

## Directory Structure

This architecture co-locates email logic and content within each feature.

```
src/
├── features/
│   └── auth/
│       └── email/
│           ├── templates/
│           │   ├── otp.njk         # Template content (HTML)
│           │   └── otp.txt         # Template content (text)
│           ├── index.ts            # Exports the sender function (e.g., sendOtpEmail)
│           └── templates.ts        # Defines the EmailConfig class (e.g., OtpEmail)
│
└── server/
    └── lib/
        └── email/
            ├── core/               # Core service logic
            ├── providers/          # Resend, Mailtrap providers
            ├── example.ts          # Standalone test script
            └── index.ts            # Main service exports
```

## Environment Examples

### Development with Mailtrap

```bash
EMAIL_PROVIDER="mailtrap"
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT="2525"
MAILTRAP_USER="your-username"
MAILTRAP_PASS="your-password"
EMAIL_FROM="dev@accntu.local"
EMAIL_FROM_NAME="Accntu Dev"
```

### Staging with Resend

```bash
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_staging_api_key"
EMAIL_FROM="staging@yourdomain.com"
EMAIL_FROM_NAME="Accntu Staging"
```

### Production with Resend

```bash
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_production_api_key"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Accntu"
EMAIL_REPLY_TO="support@yourdomain.com"
LOGO_URL="https://yourdomain.com/logo.png"
SUPPORT_EMAIL="support@yourdomain.com"
```

## Troubleshooting

### Common Issues

1. **Template not found**

    ```
    Error: Failed to render email template 'auth/missing'
    ```

    - Ensure template files exist in `templates/` directory
    - Check file extensions (`.njk` for HTML, `.txt` for text)

2. **Missing translations**

    ```
    Error: Translation key 'missing.key' not found
    ```

    - Add translation keys to locale files
    - Verify locale exists in `locales/` directory

3. **Provider configuration errors**

    ```
    Error: RESEND_API_KEY environment variable is required
    ```

    - Check environment variables are set correctly
    - Verify provider-specific configuration requirements

4. **CSS not inlining**
    - Ensure `email.css` exists in `styles/` directory
    - Check CSS syntax is valid
    - Verify `juice` package is installed

### Debugging

Enable debug logging:

```typescript
// In development
console.log('Using provider:', emailService.getProviderName());
console.log('Available locales:', emailService.getAvailableLocales());

// Check template rendering
const content = await templateService.renderTemplate({
    name: 'auth/otp',
    subject: 'auth.otp.subject',
    data: { user: { name: 'Test' }, otpCode: '123456' },
});
console.log('Rendered subject:', content.subject);
```

## Performance & Optimization

### Recommended Performance Optimizations

The current email service is designed to be simple and functional. For production deployments, consider implementing these optimizations:

#### 1. **Template Caching**

Add template compilation caching in production:

```typescript
// In EmailService class
private templateCache = new Map<string, { html: string; text?: string }>();
private shouldCache = process.env.NODE_ENV === 'production';

private async getCachedTemplate(config: EmailConfig, data: any) {
    const cacheKey = `${config.id}:${JSON.stringify(data)}`;
    
    if (this.shouldCache && this.templateCache.has(cacheKey)) {
        return this.templateCache.get(cacheKey)!;
    }
    
    const rendered = await this.templateEngine.render(config, data);
    
    if (this.shouldCache) {
        this.templateCache.set(cacheKey, rendered);
    }
    
    return rendered;
}
```

#### 2. **CSS Pre-inlining**

Pre-load and inline CSS at startup:

```typescript
// In EmailTemplateEngine class
export class EmailTemplateEngine {
    private cssContent?: string;
    
    constructor(config: TemplateEngineConfig) {
        if (process.env.NODE_ENV === 'production') {
            this.preloadCSS();
        }
    }
    
    private async preloadCSS() {
        const cssPath = path.join(process.cwd(), 'src/server/lib/email/styles/email.css');
        this.cssContent = await fs.readFile(cssPath, 'utf-8');
    }
}
```

#### 3. **Connection Pooling**

Enable SMTP connection pooling:

```typescript
// In SMTPProvider class
export class SMTPProvider implements EmailProvider {
    private transporter: nodemailer.Transporter;
    
    constructor(config: SMTPConfig) {
        this.transporter = nodemailer.createTransporter({
            ...config,
            pool: true,              // Enable connection pooling
            maxConnections: 5,       // Max concurrent connections
            maxMessages: 10,         // Max messages per connection
            rateDelta: 1000,         // Rate limiting
            rateLimit: 5,            // Max 5 emails per rateDelta
        });
    }
}
```

#### 4. **Template Validation**

Add development-time template validation:

```typescript
// In createEmailConfig function
export function createEmailConfig<T extends z.ZodType>(
    config: CreateEmailConfigParams<T>
): EmailConfig<T> {
    // Validate template exists in development
    if (process.env.NODE_ENV === 'development') {
        const templatePath = path.join(process.cwd(), 'src', config.templatePath);
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file not found: ${config.templatePath}`);
        }
    }
    
    return {
        ...config,
        defaultLocale: config.defaultLocale || 'en',
    };
}
```

#### 5. **Enhanced Error Context**

Add better error messages and context:

```typescript
// In EmailService class
private async validateAndRender(config: EmailConfig, data: any) {
    try {
        // Validate data against schema
        const validatedData = config.schema.parse(data);
        
        // Render template
        return await this.templateEngine.render(config, validatedData);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid data for email "${config.id}": ${error.message}`);
        }
        throw new Error(`Failed to render email "${config.id}": ${error.message}`);
    }
}
```

#### 6. **Monitoring & Analytics**

Add email send metrics:

```typescript
export interface EmailSendResponse extends EmailSendProviderResponse {
    emailConfigId: string;
    category: TMailCategory;
    timestamp: Date;
    renderTime?: number;    // Template render duration (ms)
    sendTime?: number;      // Provider send duration (ms)
    templateSize?: number;  // Rendered template size (bytes)
}

// Usage in EmailService
const renderStart = Date.now();
const rendered = await this.getCachedTemplate(config, validatedData);
const renderTime = Date.now() - renderStart;

const sendStart = Date.now();
const result = await this.provider.sendEmail(emailOptions);
const sendTime = Date.now() - sendStart;

return {
    ...result,
    emailConfigId: config.id,
    category: config.category,
    timestamp: new Date(),
    renderTime,
    sendTime,
    templateSize: rendered.html.length,
};
```

### Memory Usage

Current architecture memory footprint:

- **Templates**: Rendered on-demand (no caching by default)
- **CSS**: Loaded and processed per email (consider pre-loading)
- **i18n**: Translations loaded per render (consider caching)
- **Connections**: Created per email (SMTP pooling recommended)

### Scalability Considerations

For high-volume email sending:

1. **Queue System**: Implement email queue with Redis/Bull
2. **Rate Limiting**: Add provider-specific rate limits
3. **Retry Logic**: Implement exponential backoff for failures
4. **Health Checks**: Monitor provider connectivity
5. **Circuit Breaker**: Prevent cascade failures

## Security

### Best Practices

1. **Never log email content** in production
2. **Validate all input data** with Zod schemas
3. **Use environment variables** for sensitive configuration
4. **Sanitize template data** (auto-escaped by Nunjucks)
5. **Rate limiting** should be implemented at the application level

### Email Content Security

- All template variables are auto-escaped
- HTML sanitization is handled by the templating engine
- CSS is processed safely with `juice`
- Attachments support MIME type validation

## Contributing

### Adding New Providers

1. **Implement the interface**:

    ```typescript
    export class NewProvider implements EmailProvider {
        public readonly name = 'new-provider';

        validateConfig(): boolean {
            /* ... */
        }
        async sendEmail(options: SendEmailOptions): Promise<EmailSendResponse> {
            /* ... */
        }
    }
    ```

2. **Add to service factory**:

    ```typescript
    case 'new-provider':
      return new NewProvider(config);
    ```

3. **Update types and schemas**:
    ```typescript
    export type EmailProviderType = 'resend' | 'smtp' | 'mailtrap' | 'new-provider';
    ```

### Adding New Template Types

1. Create template files in appropriate category
2. Add translation keys to locale files
3. Add convenience method to `EmailService` if needed
4. Update documentation with examples

## License

This email service is part of the Accntu project and follows the same license terms.
