/**
 * # Email Service Test Script
 *
 * This script provides a simple way to test the email service configuration,
 * particularly for verifying the Mailtrap integration.
 *
 * ## How to Use
 *
 * 1.  **Configure Your Environment**: Ensure your `.env` file is set up with
 *     `EMAIL_PROVIDER="mailtrap"` and the correct `MAILTRAP_*` credentials.
 *
 * 2.  **Run the Script**: Execute this file directly using bun.
 *
 *     ```bash
 *     bun run src/server/lib/email/example.ts
 *     ```
 *
 * 3.  **Check Mailtrap**: Open your Mailtrap inbox. You should find a new
 *     email with the subject "👋 Hello from Accntu!".
 */
import 'dotenv/config';
import { z } from 'zod';
import { EmailConfig } from './core/config';
import { emailService } from './index';

// 1. Define a simple test email configuration
class TestEmail extends EmailConfig {
    id = 'test-email';
    templatePath = 'server/lib/email/example-template.njk';
    subjectKey = '👋 Hello from Accntu!';
    category = 'other';
    description = 'A simple email for testing the service setup.';

    // A simple schema for the test data
    schema = z.object({
        message: z.string(),
    });
}

// 2. Create a sender for the test email
const sendTestEmail = emailService.createSender(TestEmail);

// 3. The main function to send the email
async function runTest() {
    console.log('🚀 Sending test email via Mailtrap...');

    try {
        const response = await sendTestEmail({
            // You can use a real email here; Mailtrap will catch it.
            to: { email: 'test@example.com', name: 'Test User' },
            data: {
                message: 'This is a test message to confirm the email service is working.',
            },
        });

        if (response.success) {
            console.log('✅ Email sent successfully!');
            console.log('Please check your Mailtrap inbox.');
            console.log(`   Message ID: ${response.id}`);
        } else {
            console.error('❌ Failed to send email.');
            console.error('   Error:', response.error);
        }
    } catch (error) {
        console.error('An unexpected error occurred:', error);
    }
}

// 4. Create a dummy template file for the test
// In a real app, this would be in a feature directory.
import fs from 'fs';
import path from 'path';

const templateDir = path.join(process.cwd(), 'src', 'server', 'lib', 'email');
const templatePath = path.join(templateDir, 'example-template.njk');
const templateContent = `
  <h1>Hello from Accntu!</h1>
  <p>This is a test email.</p>
  <p>{{ message }}</p>
  <hr>
  <p><small>Sent via the Accntu Email Service.</small></p>
`;

// Run the script
(async () => {
    // Create the dummy template file before sending
    fs.mkdirSync(templateDir, { recursive: true });
    fs.writeFileSync(templatePath, templateContent);

    await runTest();

    // Clean up the dummy file
    fs.unlinkSync(templatePath);
})();
