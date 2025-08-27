import { tag } from '@/features/tag/server/db/schema';
import { FeatureSchema, InferSchemas } from '@/lib/schemas';

import z from 'zod';

const colorSchema = z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format');

// ====================
// Schemas
// ====================
export const tagSchemas = FeatureSchema.fromTable({
    table: tag,
    omitFields: ['createdAt', 'updatedAt', 'isActive', 'id', 'userId', 'transactionCount'],
}).forOperations(({ base }) => {
    const baseWithColor = base.extend({
        color: colorSchema,
    });

    return {
        create: {
            service: FeatureSchema.default.create(baseWithColor),
            endpoint: baseWithColor,
        },
        getById: {
            service: FeatureSchema.default.getById,
            endpoint: baseWithColor,
        },
        removeById: {
            service: FeatureSchema.default.removeById,
            endpoint: baseWithColor,
        },
        updateById: {
            service: FeatureSchema.default.updateById(baseWithColor),
            endpoint: baseWithColor,
        },
        getMany: {
            service: FeatureSchema.default.getMany(),
            endpoint: baseWithColor,
        },
        assignToTransaction: FeatureSchema.helpers.operation(() => {
            const shared = z.object({
                transactionId: z.string(),
                tagIds: z.array(z.string()),
                userId: z.string(),
            });
            return {
                service: shared,
                endpoint: shared,
            };
        }),
    };
});

// ====================
// Types
// ====================
export type TTagSchemas = InferSchemas<typeof tagSchemas>;
type AAA = TTagSchemas['operations']['getMany']['service'];

export { type TTag } from '@/features/tag/server/db/queries';
