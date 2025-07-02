/**
 * Next.js Instrumentation Hook
 *
 * This file runs once at server startup to initialize server-only functionality
 * such as environment validation and database connection checks.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
    // The `register` function is called in all environments, so we must
    // conditionally import and execute server-only code.
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { validateEnvOnServerStartup } = await import('@/lib/env');
        const { checkDbConnection } = await import('@/server/db');

        // 1. Validate environment variables
        validateEnvOnServerStartup();

        // 2. Check database connection
        await checkDbConnection();
    }
}
