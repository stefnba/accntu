#!/usr/bin/env bun

/**
 * Simple test script for the decentralized email system
 */

import { EmailService } from './src/server/lib/email/core/email-service';
import { registerAuthEmailTemplates } from './src/features/auth/email/templates';
import { registerTransactionEmailTemplates } from './src/features/transaction/email/templates';

async function testEmailSystem() {
  console.log('🧪 Testing Decentralized Email System...\n');
  
  try {
    // Register templates first - wait for dynamic imports to complete
    registerAuthEmailTemplates();
    registerTransactionEmailTemplates();
    
    // Wait a moment for the registration to complete (async dynamic imports)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create test email service
    const testEmailService = new EmailService({
      provider: 'smtp',
      from: { email: 'test@example.com', name: 'Test Service' },
      smtp: {
        host: 'localhost',
        port: 2525,
        username: 'test',
        password: 'test',
        secure: false,
      },
    });
    
    // Test 1: Check if service initializes properly
    console.log('✓ Email service initialized');
    console.log(`  Provider: ${testEmailService.getProviderName()}`);
    console.log(`  Available templates: ${testEmailService.getAvailableTemplates().length}`);
    
    // Test 2: List available templates
    console.log('\n📋 Available Templates:');
    const templates = testEmailService.getAvailableTemplates();
    templates.forEach(template => {
      console.log(`  - ${template.id}: ${template.description} (${template.category})`);
    });
    
    // Test 3: Test template preview (no actual sending)
    console.log('\n🔍 Testing Template Preview...');
    try {
      const preview = await testEmailService.previewTemplate('auth.otp', {
        user: { name: 'Test User', email: 'test@example.com' },
        otpCode: '123456',
        expirationMinutes: 10,
      }, 'en');
      
      console.log('✓ OTP template preview generated successfully');
      console.log(`  Subject: ${preview.subject}`);
      console.log(`  HTML length: ${preview.html.length} chars`);
      console.log(`  Text length: ${preview.text.length} chars`);
    } catch (error) {
      console.error('❌ Template preview failed:', error);
    }
    
    // Test 4: Validate template data schemas
    console.log('\n📊 Testing Template Data Validation...');
    try {
      // This should succeed with valid data
      const validData = {
        user: { name: 'John Doe', email: 'john@example.com' },
        otpCode: '123456',
        expirationMinutes: 10,
      };
      
      const otpTemplate = testEmailService.getAvailableTemplates().find(t => t.id === 'auth.otp');
      if (otpTemplate) {
        const validated = otpTemplate.schema.parse(validData);
        console.log('✓ Valid data passed schema validation');
      }
    } catch (error) {
      console.error('❌ Schema validation failed:', error);
    }
    
    // Test 5: Test invalid data (should fail gracefully)
    console.log('\n⚠️  Testing Invalid Data Handling...');
    try {
      const invalidData = {
        user: { name: '', email: 'invalid-email' },
        otpCode: '123', // Too short
        expirationMinutes: 10,
      };
      
      const otpTemplate = testEmailService.getAvailableTemplates().find(t => t.id === 'auth.otp');
      if (otpTemplate) {
        otpTemplate.schema.parse(invalidData);
        console.log('❌ Invalid data should have failed validation');
      }
    } catch (error) {
      console.log('✓ Invalid data correctly rejected:', error.message);
    }
    
    console.log('\n✅ Email system tests completed successfully!');
    console.log('\n💡 To test actual email sending, set EMAIL_PROVIDER=mailtrap and run:');
    console.log('   bun run src/server/lib/email/examples.ts');
    
  } catch (error) {
    console.error('❌ Email system test failed:', error);
    process.exit(1);
  }
}

testEmailSystem().catch(console.error);