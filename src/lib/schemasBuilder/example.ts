import { FeatureSchema } from "@/lib/schemasBuilder/schema-factory";
import { tag } from "@/server/db/schemas";
import z from "zod";





const schemas = FeatureSchema.fromTable(tag)
    .pick({
        description: true, name: true, color: true
    }).idFields({ id: true, })
    .userFields({ userId: true })
    .buildOpsSchemas(builder => builder.addOperation('create', ({ baseSchema, rawSchema, idFieldsSchema, userFieldsSchema }) => {
        return {
            service: rawSchema,
            endpoint: {
                json: rawSchema,
                params: idFieldsSchema,
            }
        }
    }))


const aa = schemas
// const bb = schemas.userSchema

type Schemas = z.infer<typeof schemas.baseSchema>;



