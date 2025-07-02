/**
 * Examples of using the decentralized email system
 * 
 * This file shows how to use the new type-safe, decentralized email system
 * with different templates and configurations.
 */

import { emailService } from './index';

/**
 * Example: Sending an OTP email (type-safe)
 */
export async function sendOTPExample() {
  const result = await emailService.sendEmail('auth.otp', {
    to: { email: 'user@example.com', name: 'John Doe' },
    data: {
      user: { name: 'John Doe', email: 'user@example.com' },
      otpCode: '123456',
      expirationMinutes: 10,
    },
    locale: 'en',
    tags: { type: 'authentication', flow: 'sign-in' }
  });

  if (result.success) {
    console.log('✅ OTP email sent:', result.id);
  } else {
    console.error('❌ Failed to send OTP:', result.error);
  }

  return result;
}

/**
 * Example: Sending a welcome email (type-safe)
 */
export async function sendWelcomeExample() {
  const result = await emailService.sendEmail('auth.welcome', {
    to: { email: 'newuser@example.com', name: 'Jane Smith' },
    data: {
      user: { name: 'Jane Smith', email: 'newuser@example.com' },
      gettingStartedSteps: [
        'Complete your profile',
        'Connect your bank account',
        'Set up notifications',
        'Start tracking expenses'
      ]
    },
    locale: 'en',
    tags: { type: 'onboarding', userType: 'new' }
  });

  if (result.success) {
    console.log('✅ Welcome email sent:', result.id);
  } else {
    console.error('❌ Failed to send welcome email:', result.error);
  }

  return result;
}

/**
 * Example: Sending a transaction notification (type-safe)
 */
export async function sendTransactionNotificationExample() {
  const result = await emailService.sendEmail('transaction.notification', {
    to: { email: 'user@example.com', name: 'Alice Johnson' },
    data: {
      user: { name: 'Alice Johnson', email: 'user@example.com' },
      transaction: {
        amount: -29.99,
        description: 'Coffee at Starbucks',
        date: '2025-07-02',
        category: 'Food & Dining',
        account: 'Chase Checking'
      }
    },
    locale: 'en',
    tags: { type: 'transaction', category: 'expense' }
  });

  if (result.success) {
    console.log('✅ Transaction notification sent:', result.id);
  } else {
    console.error('❌ Failed to send transaction notification:', result.error);
  }

  return result;
}

/**
 * Example: Preview template without sending
 */
export async function previewTemplateExample() {
  const preview = await emailService.previewTemplate('auth.otp', {
    user: { name: 'Test User', email: 'test@example.com' },
    otpCode: '654321',
    expirationMinutes: 10,
  }, 'en');

  console.log('📧 Template Preview:');
  console.log('Subject:', preview.subject);
  console.log('Template ID:', preview.template.id);
  console.log('Category:', preview.template.category);
  console.log('HTML Length:', preview.html.length);
  console.log('Text Length:', preview.text.length);

  return preview;
}

/**
 * Example: Get template information
 */
export function getTemplateInfoExample() {
  console.log('📋 Available Templates:');
  
  const templates = emailService.getAvailableTemplates();
  templates.forEach(template => {
    console.log(`- ${template.id}: ${template.description} (${template.category})`);
  });

  console.log('\n🏷️  Auth Templates:');
  const authTemplates = emailService.getTemplatesByCategory('authentication');
  authTemplates.forEach(template => {
    console.log(`- ${template.id}: ${template.description}`);
  });

  console.log('\n📊 Service Stats:');
  const stats = emailService.getTemplateStats();
  console.log(`- Provider: ${emailService.getProviderName()}`);
  console.log(`- Registered Templates: ${stats.registeredTemplates}`);
  console.log(`- Cached Templates: ${stats.cacheStats.size}`);
  console.log(`- Available Locales: ${emailService.getAvailableLocales().join(', ')}`);

  return { templates, authTemplates, stats };
}

/**
 * Example: Error handling
 */
export async function errorHandlingExample() {
  try {
    // This will fail because template doesn't exist
    await emailService.sendEmail('nonexistent.template' as 'auth.otp', {
      to: { email: 'test@example.com' },
      data: { invalid: 'data' } as any
    });
  } catch (error) {
    console.error('Expected error for non-existent template:', error);
  }

  try {
    // This will fail due to invalid data
    await emailService.sendEmail('auth.otp', {
      to: { email: 'test@example.com' },
      data: {
        user: { name: '', email: 'invalid-email' }, // Invalid data
        otpCode: '123', // Too short
        expirationMinutes: 10,
      }
    });
  } catch (error) {
    console.error('Expected validation error:', error);
  }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 Running Email Service Examples...\n');

  // Template info
  getTemplateInfoExample();

  // Preview without sending
  console.log('\n📋 Template Preview:');
  await previewTemplateExample();

  // Error handling
  console.log('\n❌ Error Handling:');
  await errorHandlingExample();

  // Only send actual emails if we're in development with Mailtrap
  if (process.env.EMAIL_PROVIDER === 'mailtrap') {
    console.log('\n📧 Sending Test Emails (Mailtrap):');
    await sendOTPExample();
    await sendWelcomeExample();
    await sendTransactionNotificationExample();
  } else {
    console.log('\n⚠️  Skipping email sending (not using Mailtrap)');
    console.log('   Set EMAIL_PROVIDER=mailtrap to test actual email sending');
  }

  console.log('\n✅ Examples completed!');
}

// Export for direct usage
export default {
  sendOTPExample,
  sendWelcomeExample,
  sendTransactionNotificationExample,
  previewTemplateExample,
  getTemplateInfoExample,
  errorHandlingExample,
  runAllExamples,
};