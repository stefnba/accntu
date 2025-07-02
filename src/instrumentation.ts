/**
 * Next.js Instrumentation Hook
 * 
 * This file validates environment variables at server startup before the application
 * begins processing requests. This ensures that configuration issues are caught early.
 */

import { ZodIssue } from 'zod';

/**
 * Constructs readable error messages from Zod validation issues
 */
function constructEnvErrorMessages(errors: ZodIssue[]): string[] {
  return errors.map((error, idx) => {
    return `${idx + 1}) ${error.path.join('.')}: ${error.message}`;
  });
}

/**
 * Validates server environment variables using our existing validation
 */
async function validateServerEnv() {
  try {
    // Dynamic import to avoid circular dependencies
    const { serverEnvSchema } = await import('./lib/env');
    return serverEnvSchema.safeParse(process.env);
  } catch (error) {
    console.error('Failed to load environment validation:', error);
    return { 
      success: false, 
      error: { 
        issues: [{ 
          path: ['SYSTEM'], 
          message: 'Failed to load validation',
          code: 'custom' as const,
        }] 
      } 
    };
  }
}

/**
 * Next.js instrumentation register function - runs at server startup
 */
export async function register() {
  // Only validate on server startup, not in browser or edge runtime
  if (typeof window !== 'undefined' || 'EdgeRuntime' in globalThis) {
    return;
  }

  console.log('🔍 Validating environment variables at server startup...');

  const envValidationResult = await validateServerEnv();

  if (!envValidationResult.success) {
    const errorMessages = constructEnvErrorMessages(envValidationResult.error.issues);
    
    console.error('\n❌ Environment validation failed at server startup:');
    console.error(`${errorMessages.join('\n')}\n`);
    console.error('💡 Please check your .env file and ensure all required variables are set.');
    console.error('📋 See .env.example for a complete template.\n');
    
    throw new Error(
      `Environment validation failed:\n${errorMessages.join('\n')}\n\nServer cannot start with invalid configuration.`
    );
  }

  console.log('✅ Environment variables validated successfully at startup');
}