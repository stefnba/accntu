import { FeatureSchema } from "@/lib/schemasBuilder/schema-factory";
import { tag } from "@/server/db/schemas";
import z from "zod";





const { opSchemas: tagSchemas, baseSchema } = FeatureSchema.fromTable(tag)
    .pick({
        description: true, name: true, color: true
    }).idFields({ id: true, })
    .userFields({ userId: true })
    .buildOpSchemas(builder => {
        const builderWithCreate = builder.addOperation('create', ({ baseSchema, rawSchema, idFieldsSchema, userFieldsSchema, serviceInputBuilder }) => {
            return {
                // Option 1: Using serviceInputBuilder helper
                service: serviceInputBuilder.create(baseSchema),
                endpoint: {
                    json: rawSchema,
                    param: idFieldsSchema,
                }
            }
        });

        const builderWithGetMany = builderWithCreate.addOperation('updateById', ({ baseSchema, idFieldsSchema, userFieldsSchema }) => {
            return {
                service: {
                    data: baseSchema,
                    idFields: baseSchema,
                },
                endpoint: {
                    json: baseSchema,
                }
            }
        });

        const builderWithGetById = builderWithCreate.addOperation('getById', ({ idFieldsSchema, userFieldsSchema, baseSchema }) => {
            return {
                // IntelliSense should show: idFields, userFields (no data allowed)
                service: {
                    idFields: baseSchema,
                },
                endpoint: {
                    param: idFieldsSchema,
                }
            }
        });

        return builderWithGetById.addOperation('updateById', ({ baseSchema, idFieldsSchema, userFieldsSchema }) => {
            return {
                // IntelliSense should show: data, idFields, userFields
                service: {
                    data: baseSchema.partial(),
                    idFields: baseSchema,
                },
                endpoint: {
                    json: baseSchema.partial(),
                    param: idFieldsSchema,
                }
            }
        });
    })

// Test type inference
// const createOp = tagSchemas.getById.;
const getByIdOp = tagSchemas.getById;
const updateByIdOp = tagSchemas.updateById;

// Test IntelliSense for service object construction
const testCreateService = {
    data: baseSchema,
    idFields: baseSchema,
    userFields: baseSchema,
    // Should show IntelliSense for create operation fields: data, idFields, userFields
};

const testGetByIdService = {
    idFields: baseSchema,
    userFields: baseSchema,
    // Should show IntelliSense for getById operation fields: idFields, userFields (no data)
};

type Schemas = z.infer<typeof baseSchema>;



