import { FeatureSchema } from "@/lib/schemasBuilder/schema-factory";
import { AvailableOperationKeys, CoreOperationKeys, InferSchemas } from "@/lib/schemasBuilder/types";
import { tag } from "@/server/db/schemas";
import z from "zod";





const { opSchemas: tagSchemas, baseSchema } = FeatureSchema.fromTable(tag)
    .pick({
        description: true, name: true, color: true
    }).idFields({ id: true, userId: true })
    .buildOpSchemas(builder => builder.addOperation('removeById', ({ baseSchema, rawSchema, idFieldsSchema, serviceInputBuilder }) => {
        return {
            service: {
                data: baseSchema,
                idFields: idFieldsSchema,
            },
            endpoint: {
                json: rawSchema,
                param: idFieldsSchema,
            }
        }
    }).addOperation('removeById', ({ idFieldsSchema }) => {
        return {
            service: {
                idFields: idFieldsSchema,
            },
            endpoint: {
                param: idFieldsSchema,
            }
        }
    }).addOperation('create', ({ baseSchema, idFieldsSchema, serviceInputBuilder }) => {
        return {
            service: serviceInputBuilder.updateById(baseSchema.partial()),
            endpoint: {
                json: baseSchema.partial(),
                param: idFieldsSchema,
            }
        }
    }))

// Test successful schema creation
const createOp = tagSchemas.removeById.endpoint.param
const getByIdOp = tagSchemas.getById;
const updateByIdOp = tagSchemas.updateById;

type Schemas = z.infer<typeof createOp>;





type TagSchemas = InferSchemas<typeof tagSchemas>['services'];

// Test CoreOperationKeys resolution
type TestCoreKeys = CoreOperationKeys;
type TestAvailableKeys = AvailableOperationKeys<'create' | 'getById' | 'updateById'>;
