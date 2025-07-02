import type { ZodIssue } from 'zod';

/**
 * Constructs readable error messages from Zod validation issues
 */
export function constructZodErrorMessages(errors: ZodIssue[]): string[] {
    return errors.map((error, idx) => {
        return `${idx + 1}) ${error.path.join('.')}: ${error.message}`;
    });
}
