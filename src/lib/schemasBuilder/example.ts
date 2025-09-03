import { FeatureSchema } from "@/lib/schemasBuilder/schema-factory";
import { tag } from "@/server/db/schemas";
import z from "zod";





const { opSchemas: tagSchemas, baseSchema } = FeatureSchema.fromTable(tag)
    .pick({
        description: true, name: true, color: true
    }).idFields({ id: true, })
    .userFields({ userId: true })
    .buildOpSchemas(builder => builder.addOperation('create', ({ baseSchema, rawSchema, idFieldsSchema, userFieldsSchema, serviceInputBuilder }) => {
        return {
            service: serviceInputBuilder.create(baseSchema),
            endpoint: {
                json: rawSchema,
                params: idFieldsSchema,
            }
        }
    }))


const aa = tagSchemas.create.
// const bb = schemas.userSchema

type Schemas = z.infer<typeof baseSchema>;



