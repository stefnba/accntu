import { FeatureSchema } from "@/lib/schemas/";
import { tag } from "@/server/db/schemas";
import z from "zod";





const { opSchemas: tagSchemas } = FeatureSchema.fromTable(tag)
    .pick({
        description: true, name: true, color: true
    }).idFields({ id: true, userId: true })
    .buildOpSchemas(builder => builder.addOperation('create', ({ baseSchema, rawSchema, idFieldsSchema, serviceInputBuilder }) => {
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
    }).addOperation('createMany', ({ baseSchema, idFieldsSchema, serviceInputBuilder }) => {
        return {
            service: {

            },
            endpoint: {
                json: baseSchema,
                param: idFieldsSchema,
            }
        }
    }).addOperation('deleteById', ({ baseSchema, idFieldsSchema, serviceInputBuilder }) => {
        return {
            service: {
                data: baseSchema,
                idFields: idFieldsSchema,
            },
            endpoint: {
                json: baseSchema,
                param: idFieldsSchema,
            }
        }
    }).addOperation('removeManyByIds', ({ baseSchema, idFieldsSchema, serviceInputBuilder }) => {
        return {
            service: {
                data: baseSchema,
                idFields: idFieldsSchema,
            },
        }
    }))

// Test successful schema creation
const createOp = tagSchemas.removeManyByIds


type Schemas = z.infer<typeof createOp>;



