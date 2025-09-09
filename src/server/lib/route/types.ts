import { Input } from 'hono';

// Core validation targets - optimized for performance by focusing on most common cases
export type CoreValidationTargets = 'query' | 'json' | 'param';

// Extract only the core validation targets from Input
export type ExtractCoreValidatedData<I extends Input> = I extends { out: infer Out }
    ? { [K in keyof Out as K extends CoreValidationTargets ? K : never]: Out[K] }
    : Record<string, never>;
