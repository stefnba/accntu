import { nanoid } from 'nanoid';

/**
 * Generates a short, unique error ID for use in error tracing
 *
 * Uses nanoid for collision-resistant IDs suitable for production use.
 *
 * @returns A unique error trace ID (10 characters)
 *
 * @example
 * ```typescript
 * const errorId = generateErrorId();
 * // Result: "V1StGXR8_Z"
 * ```
 */
export function generateErrorId(): string {
    return nanoid(10);
}
