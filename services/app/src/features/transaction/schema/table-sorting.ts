import { transaction } from '@db/schema';
import { z } from 'zod';

/** Converts a plain object's keys into array that is suitable for Zod enum with type safety and autocompletion */
function prepZodEnumFromObjectKeys<
    TI extends Record<string, any>,
    R extends string = TI extends Record<infer R, any> ? R : never
>(input: TI): [R, ...R[]] {
    const [firstKey, ...otherKeys] = Object.keys(input) as [R, ...R[]];
    return [firstKey, ...otherKeys];
}

export const orderByColumns = {
    title: transaction.title,
    date: transaction.date
};

export const TransactionOrderByObjectSchema = z.object({
    column: z.enum(prepZodEnumFromObjectKeys(orderByColumns)),
    direction: z.enum(['asc', 'desc']).optional().default('asc')
});

export type TTransactionOrderByObject = z.input<
    typeof TransactionOrderByObjectSchema
>;

export const TransactionOrderBySchema = z.object({
    orderBy: z
        .array(TransactionOrderByObjectSchema)
        .optional()
        .default([
            { direction: 'desc', column: 'date' },
            { direction: 'asc', column: 'title' }
        ])
        .transform((val) => {
            return val.map((v) => {
                return {
                    column: orderByColumns[v.column],
                    direction: v.direction
                };
            });
        })
});
