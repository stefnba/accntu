# Email Service Documentation

A sophisticated email service for Accntu with multi-provider support, Jinja2-style templating, and comprehensive internationalization.

## Features

- 🔧 **Multi-Provider Support**: Resend, SMTP, and Mailtrap for different environments
- 📧 **Jinja2-Style Templates**: Identical syntax to Python Jinja2 using Nunjucks
- 🌐 **Internationalization**: Multi-language email support with i18n
- 🎨 **CSS Email Styling**: Responsive, mobile-friendly templates with automatic CSS inlining
- 🔒 **Type-Safe**: Full TypeScript support with comprehensive validation
- ⚡ **Environment-Based**: Easy switching between development, staging, and production

## Quick Start

### 1. Environment Configuration

Add email configuration to your `.env` file:

```bash
# Choose your provider
EMAIL_PROVIDER="resend"  # or "smtp" or "mailtrap"

# Sender configuration
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Accntu"
EMAIL_REPLY_TO="support@yourdomain.com"

# Resend (recommended for production)
RESEND_API_KEY="re_your_resend_api_key"

# Mailtrap (perfect for development)
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT="2525"
MAILTRAP_USER="your-mailtrap-username"
MAILTRAP_PASS="your-mailtrap-password"

# SMTP (fallback option)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_SECURE="false"
```

### 2. Basic Usage

```typescript
import { emailService } from '@/server/lib/email';

// Send OTP email (integrated with Better-Auth)
await emailService.sendOTPEmail(
  { name: 'John Doe', email: 'john@example.com' },
  '123456'
);

// Send welcome email
await emailService.sendWelcomeEmail(
  { name: 'Jane Smith', email: 'jane@example.com' }
);

// Send custom email
await emailService.sendEmail({
  to: { email: 'user@example.com', name: 'User' },
  subject: 'Custom Subject',
  html: '<h1>Hello!</h1>',
  text: 'Hello!'
});
```

## Providers

### Resend (Recommended)

Best for production with excellent developer experience:

```typescript
const service = new EmailService({
  provider: 'resend',
  resend: { apiKey: 're_your_api_key' },
  from: { email: 'noreply@yourdomain.com', name: 'Your App' }
});
```

**Benefits:**
- 3,000 emails/month free
- Excellent deliverability
- TypeScript-first API
- Great developer tools

### Mailtrap (Development)

Perfect for development and testing:

```typescript
const service = new EmailService({
  provider: 'mailtrap',
  mailtrap: {
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    username: 'your-username',
    password: 'your-password'
  },
  from: { email: 'test@example.com', name: 'Test App' }
});
```

**Benefits:**
- Captures emails without sending
- Great for testing email templates
- Free tier available
- Debugging tools

### SMTP (Fallback)

Universal SMTP support for any email provider:

```typescript
const service = new EmailService({
  provider: 'smtp',
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    username: 'your-email@gmail.com',
    password: 'your-app-password',
    secure: false
  },
  from: { email: 'noreply@yourdomain.com', name: 'Your App' }
});
```

## Templates

### Available Templates

1. **OTP Verification** (`auth/otp`)
   - Branded verification code display
   - Expiration warnings
   - Support contact information

2. **Welcome Email** (`auth/welcome`)
   - Personalized greeting
   - Getting started guide
   - Call-to-action buttons

3. **Transaction Notifications** (`notifications/transaction`)
   - Transaction details with formatting
   - Amount highlighting (income/expense)
   - View details links

### Template Syntax

Templates use Jinja2-identical syntax via Nunjucks:

```html
<!-- auth/welcome.njk -->
{% extends "layouts/base.njk" %}

{% block content %}
<h1>{{ __('auth.welcome.title', { name: user.name }) }}</h1>

<p>{{ __('auth.welcome.message') }}</p>

{% if user.isPremium %}
  <div class="premium-notice">
    {{ __('auth.welcome.premium_message') }}
  </div>
{% endif %}

<div class="getting-started">
  {% for step in gettingStartedSteps %}
    <p>{{ loop.index }}. {{ step }}</p>
  {% endfor %}
</div>
{% endblock %}
```

### Creating Custom Templates

1. **Create HTML template** (`templates/your-category/template-name.njk`):

```html
{% extends "layouts/base.njk" %}

{% block title %}{{ __('your.template.subject') }}{% endblock %}

{% block content %}
<h1>{{ __('your.template.title') }}</h1>
<p>Hello {{ user.name }}!</p>

{% if customData %}
  <div class="custom-section">
    {{ customData.message }}
  </div>
{% endif %}
{% endblock %}
```

2. **Create plain text version** (`templates/your-category/template-name.txt`):

```text
{{ __('your.template.title') }}

Hello {{ user.name }}!

{% if customData %}
{{ customData.message }}
{% endif %}

---
{{ __('common.footer.company') }}
```

3. **Add translations** (`locales/en.json`):

```json
{
  "your": {
    "template": {
      "subject": "Your Custom Email",
      "title": "Custom Email Title"
    }
  }
}
```

4. **Use the template**:

```typescript
const content = await templateService.renderTemplate({
  name: 'your-category/template-name',
  subject: 'your.template.subject',
  locale: 'en',
  data: {
    user: { name: 'John Doe' },
    customData: { message: 'Custom message here' }
  }
});

await emailService.sendEmail({
  to: { email: 'user@example.com', name: 'John Doe' },
  subject: content.subject,
  html: content.html,
  text: content.text
});
```

## Internationalization

### Adding New Languages

1. **Create locale file** (`locales/es.json`):

```json
{
  "auth": {
    "otp": {
      "subject": "Tu código de verificación de Accntu",
      "title": "Verifica tu dirección de correo",
      "message": "Hola {{name}}, usa este código de verificación:"
    }
  }
}
```

2. **Use with templates**:

```typescript
await emailService.sendOTPEmail(user, otpCode, 'es');
```

### Translation Keys

All text in templates should use translation keys:

```html
<!-- Good -->
<h1>{{ __('auth.welcome.title') }}</h1>

<!-- Bad -->
<h1>Welcome to Accntu!</h1>
```

## Advanced Usage

### Custom Email Service

```typescript
import { EmailService, ResendProvider, MailtrapProvider } from '@/server/lib/email';

// Create custom configuration
const emailService = new EmailService({
  provider: 'resend',
  resend: { apiKey: process.env.RESEND_API_KEY! },
  from: { 
    email: 'noreply@yourdomain.com', 
    name: 'Your App Name' 
  },
  replyTo: { 
    email: 'support@yourdomain.com', 
    name: 'Support Team' 
  }
});

// Send with custom options
await emailService.sendEmail({
  to: [
    { email: 'user1@example.com', name: 'User One' },
    { email: 'user2@example.com', name: 'User Two' }
  ],
  subject: 'Bulk Email',
  html: htmlContent,
  text: textContent,
  tags: { 
    campaign: 'newsletter',
    segment: 'premium-users'
  },
  headers: {
    'X-Priority': '1',
    'X-Custom-Header': 'custom-value'
  }
});
```

### Direct Provider Usage

```typescript
import { ResendProvider, MailtrapProvider } from '@/server/lib/email';

// Use provider directly
const resend = new ResendProvider({
  apiKey: 'your-api-key',
  from: { email: 'noreply@example.com' }
});

const response = await resend.sendEmail({
  to: { email: 'user@example.com' },
  from: { email: 'noreply@example.com' },
  subject: 'Direct Send',
  html: '<h1>Hello</h1>',
  text: 'Hello'
});

if (response.success) {
  console.log('Email sent:', response.id);
}
```

### Template Service Only

```typescript
import { EmailTemplateService } from '@/server/lib/email';

const templateService = new EmailTemplateService();

// Render template without sending
const content = await templateService.renderOTPEmail(
  { name: 'John', email: 'john@example.com' },
  '123456',
  'en'
);

console.log(content.html);    // Rendered HTML
console.log(content.text);    // Plain text version
console.log(content.subject); // Localized subject
```

## Directory Structure

```
src/server/lib/email/
├── providers/              # Email provider implementations
│   ├── types.ts           # Provider interfaces and types
│   ├── resend.ts          # Resend provider
│   ├── smtp.ts            # SMTP provider
│   └── mailtrap.ts        # Mailtrap provider
├── services/              # Core services
│   ├── email.ts           # Main email service
│   └── template.ts        # Template rendering service
├── templates/             # Email templates (Jinja2 syntax)
│   ├── layouts/           # Base templates
│   │   └── base.njk      # Main layout template
│   ├── auth/              # Authentication emails
│   │   ├── otp.njk       # OTP verification HTML
│   │   ├── otp.txt       # OTP verification text
│   │   ├── welcome.njk   # Welcome email HTML
│   │   └── welcome.txt   # Welcome email text
│   └── notifications/     # Notification emails
│       ├── transaction.njk
│       └── transaction.txt
├── locales/               # Internationalization
│   ├── en.json           # English translations
│   ├── es.json           # Spanish translations
│   └── fr.json           # French translations
├── styles/               # Email CSS
│   └── email.css         # Main email styles
├── schemas.ts            # Zod validation schemas
├── index.ts              # Main exports
└── README.md             # This documentation
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
  data: { user: { name: 'Test' }, otpCode: '123456' }
});
console.log('Rendered subject:', content.subject);
```

## Performance

### Production Optimizations

1. **Template precompilation**:
   ```typescript
   if (process.env.NODE_ENV === 'production') {
     templateService.precompileTemplates();
   }
   ```

2. **CSS caching**: CSS is loaded once and cached in memory

3. **Connection pooling**: Providers use connection pooling when available

### Memory Usage

- Templates are cached after first render
- CSS content is loaded once at startup
- i18n translations are cached in memory
- Provider connections are reused

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
     
     validateConfig(): boolean { /* ... */ }
     async sendEmail(options: SendEmailOptions): Promise<EmailSendResponse> { /* ... */ }
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