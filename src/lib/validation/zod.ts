import { typedFromEntries, typedKeys } from '@/lib/utils';
import { Prettify } from '@/types/utils';
import { getTableColumns, Table } from 'drizzle-orm';
import { core, util, z, ZodIssue, ZodObject } from 'zod';
import { TZodShape } from './types';

/**
 * Constructs readable error messages from Zod validation issues
 */
export function constructZodErrorMessages(errors: ZodIssue[]): string[] {
    return errors.map((error, idx) => {
        return `${idx + 1}) ${error.path.join('.')}: ${error.message}`;
    });
}

export interface FieldError {
    path: PropertyKey[];
    message: string;
    value: any;
}

/**
 * A utility to safely retrieve a value from a nested object based on a path array.
 * @param obj - The object to retrieve the value from.
 * @param path - An array of keys representing the path to the value.
 * @returns The value if found, otherwise undefined.
 */
function getValueFromPath(obj: any, path: PropertyKey[]): any {
    return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

/**
 * Parses a ZodError to extract detailed, structured information about each validation issue.
 * @param error - The ZodError instance.
 * @param rawData - The original raw data object that was validated.
 * @returns An array of structured field errors.
 */
export function parseZodError(error: z.ZodError, rawData: Record<string, any>): FieldError[] {
    return error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
        value: getValueFromPath(rawData, issue.path),
    }));
}

/**
 * Utility to pick specific fields from a Zod object schema.
 *
 * This is a type-safe wrapper around Zod's .pick() method that ensures
 * proper inference of the picked fields.
 *
 * @param schema - The source ZodObject to pick fields from
 * @param fields - Array of field names to include in the result
 * @returns New ZodObject containing only the specified fields
 *
 * @example
 * ```ts
 * const fullSchema = z.object({
 *   id: z.string(),
 *   name: z.string(),
 *   email: z.string(),
 *   password: z.string(),
 * });
 *
 * const publicSchema = pickFields(fullSchema, ['id', 'name', 'email']);
 * // Result: ZodObject<{ id: string; name: string; email: string }>
 * ```
 */
export function pickFields<TSchema extends TZodShape, TKeys extends Array<keyof TSchema>>(
    schema: z.ZodObject<TSchema>,
    fields: TKeys
): ZodObject<
    util.Flatten<Pick<TSchema, Extract<keyof TSchema, keyof { [K in TKeys[number]]: true }>>>,
    core.$strip
> {
    const mask: util.Mask<keyof TSchema> = typedFromEntries(fields.map((field) => [field, true]));
    return schema.pick(mask);
}

/**
 * Safely picks fields from a Zod object schema, ignoring fields that don't exist in the schema.
 *
 * Unlike standard .pick() or pickFields(), this accepts any string keys and will not throw
 * if you try to pick a field that doesn't exist. It only picks fields that are both
 * requested and present in the schema.
 *
 * @param schema - The source ZodObject
 * @param fields - Array of field names to include (can include keys not in schema)
 * @returns New ZodObject with valid fields picked
 *
 * @example
 *
 * const schema = z.object({ a: z.string(), b: z.string() });
 * // Safe even though 'c' is not in schema
 * const result = safePick(schema, ['a', 'c']);
 * // Result: ZodObject<{ a: string }>
 *  */
export function safePick<TSchema extends TZodShape, const TKeys extends readonly string[]>(
    schema: z.ZodObject<TSchema>,
    fields: TKeys
) {
    const validFields = fields.filter((field): field is Extract<keyof TSchema, TKeys[number]> =>
        Object.prototype.hasOwnProperty.call(schema.shape, field)
    );

    return pickFields(schema, validFields);
}

/**
 * Utility to omit specific fields from a Zod object schema.
 *
 * This is a type-safe wrapper around Zod's .omit() method that ensures
 * proper inference of the remaining fields.
 *
 * @param schema - The source ZodObject to omit fields from
 * @param fields - Array of field names to exclude from the result
 * @returns New ZodObject containing all fields except the specified ones
 *
 * @example
 * ```ts
 * const fullSchema = z.object({
 *   id: z.string(),
 *   name: z.string(),
 *   email: z.string(),
 *   password: z.string(),
 * });
 *
 * const publicSchema = omitFields(fullSchema, ['password']);
 * // Result: ZodObject<{ id: string; name: string; email: string }>
 * ```
 */
export function omitFields<TSchema extends TZodShape, TKeys extends Array<keyof TSchema>>(
    schema: z.ZodObject<TSchema>,
    fields: TKeys
): ZodObject<Prettify<Omit<TSchema, Extract<keyof TSchema, TKeys[number]>>>, core.$strip> {
    const mask: { [K in TKeys[number]]: true } = typedFromEntries(
        fields.map((field) => [field, true])
    );
    return schema.omit(mask);
}

/**
 * Safely omits fields from a Zod object schema, ignoring fields that don't exist in the schema.
 *
 * Unlike standard .omit() or omitFields(), this accepts any string keys and will not throw
 * if you try to omit a field that doesn't exist. It only omits fields that are both
 * requested and present in the schema.
 *
 * @param schema - The source ZodObject
 * @param fields - Array of field names to exclude (can include keys not in schema)
 * @returns New ZodObject with valid fields omitted
 *
 * @example
 *
 * const schema = z.object({ a: z.string(), b: z.string() });
 * // Safe even though 'c' is not in schema
 * const result = safeOmit(schema, ['a', 'c']);
 * // Result: ZodObject<{ b: string }>
 *  */
export function safeOmit<TSchema extends TZodShape, const TKeys extends readonly string[]>(
    schema: z.ZodObject<TSchema>,
    fields: TKeys
) {
    const validFields = fields.filter((field): field is Extract<keyof TSchema, TKeys[number]> =>
        Object.prototype.hasOwnProperty.call(schema.shape, field)
    );

    return omitFields(schema, validFields);
}

/**
 * Utility to get the fields of a Zod object schema as an array with type support.
 *
 * @param schema - The Zod object schema to get the fields from
 * @returns An array of the fields of the schema with type support
 *
 * @example
 * ```ts
 * const fields = getFieldsAsArray(mySchema); // Returns (keyof schema['shape'])[]
 * ```
 */
export const getFieldsAsArray = <T extends z.ZodObject>(schema: T): (keyof T['shape'])[] => {
    return schema.keyof().options;
};

/**
 * Utility to get fields from a Zod schema as an array, validated against table columns.
 *
 * Returns only the schema keys that exist in the table's columns, providing both runtime
 * validation and proper type inference without type assertions.
 *
 * @param schema - The Zod object schema
 * @param table - The Drizzle table to validate against
 * @returns An array of schema keys that are valid table columns
 *
 * @example
 * ```ts
 * // Returns only keys that exist in both schema and table columns
 * const columns = getFieldsAsArrayConstrained(config.selectReturnSchema, table);
 * // Type: Array<Extract<keyof TSchema, keyof TTable['_']['columns']>>
 * ```
 */
export const getFieldsAsArrayConstrained = <TSchema extends TZodShape, TTable extends Table>(
    schema: z.ZodObject<TSchema>,
    table: TTable
): Array<Extract<keyof TSchema, keyof TTable['_']['columns']>> => {
    const schemaKeys = schema.keyof().options;
    const tableColumns = typedKeys(getTableColumns(table));

    // Return only schema keys that are actual table columns
    return schemaKeys.filter((key) => tableColumns.includes(key)) as Array<
        Extract<keyof TSchema, keyof TTable['_']['columns']>
    >;
};
