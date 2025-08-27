import { FeatureSchema } from '@/lib/schemas/factory';
import { InferSchemas } from '@/lib/schemas/types';
import { tag } from '@/server/db/schemas';
import { z } from 'zod';

// Example usage
export const tagSchemas = FeatureSchema.fromTable({
    table: tag,
    // omitFields: ['color', 'description'],
    pickFields: ['name', 'id'],
})
    .createQuerySchema((s) => ({
        create: s
            .omit({
                name: true,
            })
            .extend({
                hallo: z.string(),
                man: z.number(),
            }),
        get: s.omit({
            name: true,
        }),
    }))
    .createServiceSchema((s) => ({
        create: s.create,
        get: s.get,
        ddd: s.get.extend({
            extra: z.string(),
        }),
        updateById: s.get.extend({
            id: z.string(),
            userId: z.string(),
            data: s.create,
        }),
    }))
    .createEndpointSchema((s) => ({
        ...s,
        ddd: s.ddd,
    }))
    .build();

// Examples of the InferSchemas type helper:

type TTagSchemas = InferSchemas<typeof tagSchemas>;
type TBaseSchema = TTagSchemas['baseSchema'];
type TServiceSchema = TTagSchemas['serviceSchemas'];
