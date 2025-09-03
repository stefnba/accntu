import { FeatureSchema } from "@/lib/schemasBuilder/schema-factory";
import { InferSchemas } from "@/lib/schemasBuilder/types";
import { tag } from "@/server/db/schemas";
import z from "zod";





const { opSchemas: tagSchemas, baseSchema } = FeatureSchema.fromTable(tag)
    .pick({
        description: true, name: true, color: true
    }).idFields({ id: true, userId: true })
    .buildOpSchemas(builder => {
        const builderWithCreate = builder.addOperation('create', ({ baseSchema, rawSchema, idFieldsSchema, serviceInputBuilder }) => {
            return {
                service: serviceInputBuilder.create(baseSchema),
                endpoint: {
                    json: rawSchema,
                    param: idFieldsSchema,
                }
            }
        });

        const builderWithGetById = builderWithCreate.addOperation('getById', ({ idFieldsSchema }) => {
            return {
                service: {
                    idFields: idFieldsSchema,
                },
                endpoint: {
                    param: idFieldsSchema,
                }
            }
        });

        return builderWithGetById.addOperation('updateById', ({ baseSchema, idFieldsSchema, serviceInputBuilder }) => {
            return {
                service: serviceInputBuilder.updateById(baseSchema.partial()),
                endpoint: {
                    json: baseSchema.partial(),
                    param: idFieldsSchema,
                }
            }
        });
    })

// Test successful schema creation
const createOp = tagSchemas.create.service
const getByIdOp = tagSchemas.getById;
const updateByIdOp = tagSchemas.updateById;

type Schemas = z.infer<typeof createOp>;





type TagSchemas = InferSchemas<typeof tagSchemas>['endpoints'];
