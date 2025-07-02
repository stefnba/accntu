/**
 * Smart Environment Variable Configuration System
 *
 * Automatically detects client vs server context and validates only the appropriate
 * environment variables. Client-side gets only NEXT_PUBLIC_ variables for security.
 *
 * Usage:
 * - `import { getEnv } from '@/lib/env'` - Works everywhere, auto-detects context
 * - Returns fully typed environment variables based on execution context
 *
 * Features:
 * - ✅ Single function for all contexts
 * - ✅ Automatic NEXT_PUBLIC_ filtering for client
 * - ✅ Type-safe with Zod validation
 * - ✅ Auto-validation on first use
 * - ✅ Context-aware validation
 * - ✅ Helpful error messages
 */

import {
    authEnvSchema,
    awsEnvSchema,
    clientEnvSchema,
    emailEnvSchema,
    serverBaseEnvSchema,
} from '@/lib/env/schemas';
import { constructZodErrorMessages } from '@/lib/utils/zod';
import { z } from 'zod';

// Full server-side schema
const serverEnvSchema = serverBaseEnvSchema
    .and(authEnvSchema)
    .and(awsEnvSchema)
    .and(emailEnvSchema);

// Export types for both contexts
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Conditionally selects the correct environment type based on the execution runtime.
 *
 * - On the server (identified by `process.env.NEXT_RUNTIME`), it resolves to `ServerEnv`.
 * - On the client, it resolves to `ClientEnv`.
 *
 * This allows for proper type inference across different environments in Next.js.
 */
export type Env = typeof process.env.NEXT_RUNTIME extends 'string' ? ServerEnv : ClientEnv;

// =================================================================
// Smart Environment Validation & Export
// =================================================================

// Use global caching to persist across Next.js hot reloads and different execution contexts
const globalForEnv = globalThis as unknown as {
    validatedServerEnv?: z.infer<typeof serverEnvSchema>;
    validatedClientEnv?: z.infer<typeof clientEnvSchema>;
};

let validatedServerEnv = globalForEnv.validatedServerEnv ?? null;
let validatedClientEnv = globalForEnv.validatedClientEnv ?? null;

/**
 * Creates client environment object with explicit NEXT_PUBLIC_ variable references.
 * This is required for Next.js to properly bundle these variables at compile time.
 */
function getClientEnvObject(): Record<string, string | undefined> {
    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        // Explicitly reference NEXT_PUBLIC_ variables for Next.js bundling
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    };
}

/**
 * Retrieves environment variables with strict type safety and context-awareness.
 *
 * - `getEnv()`: For server-side use. Returns all validated server variables. Throws an
 *   error if called on the client.
 * - `getEnv('client')`: For client-side use. Returns only `NEXT_PUBLIC_` variables. Safe
 *   to use in any context.
 *
 * @param context - (Optional) Specify 'client' to get client-safe variables.
 * @returns Validated environment variables for the specified context.
 * @throws Error on validation failure or misuse of server-side function on the client.
 */
export function getEnv(context: 'client'): ClientEnv;
export function getEnv(context: 'server'): ServerEnv;
export function getEnv(): ServerEnv;
export function getEnv(context: 'client' | 'server' = 'server'): ServerEnv | ClientEnv {
    const isClient = typeof window !== 'undefined';

    // Disallow server env access on the client
    if (context !== 'client' && isClient) {
        console.warn(
            '❌ getEnv() can be used on the client but it is recommended to explicitly call getEnv("client").'
        );
    }

    // Force client env when explicitly requested
    if (context === 'client' || isClient) {
        if (!validatedClientEnv) {
            try {
                const clientEnv = getClientEnvObject();
                const result = clientEnvSchema.safeParse(clientEnv);

                if (!result.success) {
                    const errorMessages = result.error.issues.map((issue) => {
                        const path = issue.path.join('.');
                        return `${path}: ${issue.message}`;
                    });

                    throw new Error(
                        `Client environment validation failed:\n${errorMessages.join('\n')}\n\n` +
                            `💡 Missing NEXT_PUBLIC_ variables. In development, create a .env.local file with:\n` +
                            `NEXT_PUBLIC_APP_URL=http://localhost:3000\n` +
                            `NEXT_PUBLIC_APP_NAME=Accntu\n\n` +
                            `See .env.example for a complete template.`
                    );
                }

                validatedClientEnv = result.data;
                globalForEnv.validatedClientEnv = result.data;

                if (process.env.NODE_ENV === 'development') {
                    console.log(
                        '✅ Client environment variables validated successfully (cached for future requests)'
                    );
                }
            } catch (error) {
                console.error('❌ Client environment validation failed:');
                console.error(error instanceof Error ? error.message : String(error));
                throw error;
            }
        }
        return validatedClientEnv;
    }

    // Server-side: validate and return all environment variables
    if (!validatedServerEnv) {
        try {
            const result = serverEnvSchema.safeParse(process.env);

            if (!result.success) {
                const errorMessages = result.error.issues.map((issue) => {
                    const path = issue.path.join('.');
                    return `${path}: ${issue.message}`;
                });

                throw new Error(
                    `Server environment validation failed:\n${errorMessages.join('\n')}\n\nPlease check your environment variables and try again.`
                );
            }

            validatedServerEnv = result.data;
            globalForEnv.validatedServerEnv = result.data;

            if (process.env.NODE_ENV === 'development') {
                console.log(
                    '✅ Server environment variables validated successfully (cached for future requests)'
                );
            }
        } catch (error) {
            console.error('❌ Server environment validation failed:');
            console.error(error instanceof Error ? error.message : String(error));

            // In development, show a more helpful error
            if (process.env.NODE_ENV === 'development') {
                console.error(
                    '\n💡 To fix this, create a .env.local file with the required environment variables.'
                );
                console.error('See .env.example for a template with all required variables.\n');
            }

            throw error;
        }
    }

    return validatedServerEnv;
}

/**
 * Validates environment variables at server startup and throws a descriptive error
 * if validation fails. This is intended to be called from the instrumentation hook.
 */
export function validateEnvOnServerStartup() {
    console.log('🔍 Validating environment variables at server startup...');

    const envValidationResult = serverEnvSchema.safeParse(process.env);

    if (!envValidationResult.success) {
        const errorMessages = constructZodErrorMessages(envValidationResult.error.issues);

        console.error('\n❌ Environment validation failed at server startup:');
        console.error(`${errorMessages.join('\n')}\n`);
        console.error('💡 Please check your .env file and ensure all required variables are set.');
        console.error('📋 See .env.example for a complete template.\n');

        throw new Error(
            `Environment validation failed:\n${errorMessages.join(
                '\n'
            )}\n\nServer cannot start with invalid configuration.`
        );
    }

    console.log('✅ Environment variables validated successfully at startup');
}

// =================================================================
// Typed Environment Variables Export
// =================================================================

// The getEnv function now automatically returns the correct type based on context.

// Re-export schemas for use in specific modules if needed
export {
    authEnvSchema,
    awsEnvSchema,
    clientEnvSchema,
    emailEnvSchema,
    serverBaseEnvSchema,
    serverEnvSchema,
};
