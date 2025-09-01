import { z } from 'zod';

// ===========================
// Zod Schemas
// ===========================

export const endpointSelectSchema = z.object({
    id: z.string(),
});
