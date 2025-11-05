/**
 * Standard function signature for all database query functions.
 * All query functions must be async and return a Promise.
 *
 * @template Input - The input parameter type (defaults to any for flexibility)
 * @template Output - The return type (defaults to any for flexibility)
 */
export type QueryFn<Input = unknown, Output = unknown> = (args: Input) => Promise<Output>;
