import { Context, Input } from 'hono';
import { CoreValidationTargets, ExtractCoreValidatedData } from './types';

/**
 * Get core validated data from Hono context in a single call (query, json, param only)
 *
 * Performance optimized version that only checks the 3 most commonly used validation targets.
 * This reduces loop iterations by 50% compared to checking all 6 targets.
 *
 * This function bypasses TypeScript's overly restrictive constraints on c.req.valid()
 * while maintaining runtime safety and type correctness.
 *
 * @param c - Hono context with validated data
 * @returns Object containing validated core targets (query, json, param) that were actually validated
 */
export const getAllValidated = <I extends Input>(
    c: Context<any, any, I>
): ExtractCoreValidatedData<I> => {
    // Performance: Only check the 3 most common targets (reduces iterations by 50%)
    const targets: readonly CoreValidationTargets[] = ['query', 'json', 'param'] as const;
    const result = {} as Record<CoreValidationTargets, unknown>;
    const req = c.req;

    // Performance: Use for loop instead of forEach (slightly faster)
    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];

        // SAFE TYPE ASSERTION: We use 'as any' here because:
        // 1. TypeScript's constraint (keyof I['out'] & keyof ValidationTargets) is overly restrictive
        // 2. Hono's req.valid() method actually handles missing targets gracefully (returns undefined)
        // 3. We check for undefined values before adding to result
        // 4. The runtime behavior is exactly what we want: get data for valid targets, skip invalid ones
        // 5. The object #validatedData containing the validated data is private, so we need to use the req.valid() method to access it
        // https://github.com/honojs/hono/blob/6792789ec06bd14c96ecdf38a368f7d7526e601a/src/request.ts#L327
        const value = req.valid(target as any);

        // Only include targets that actually have validated data
        if (value !== undefined) {
            result[target] = value;
        }
    }

    // SAFE TYPE ASSERTION: We know the result contains exactly the validated data
    // that matches the ExtractCoreValidatedData<I> shape, because:
    // 1. We only include targets that have actual values (undefined check above)
    // 2. ExtractCoreValidatedData<I> only includes core targets present in I['out']
    // 3. The type system ensures the final shape is correct
    return result as ExtractCoreValidatedData<I>;
};
