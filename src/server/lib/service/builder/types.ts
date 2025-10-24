/**
 * Standard function signature for all service functions.
 * Services coordinate business logic and call query functions.
 *
 * @template Input - The input parameter type (defaults to unknown for strict typing)
 * @template Output - The return type (defaults to unknown for strict typing)
 */
export type ServiceFn<Input = unknown, Output = unknown> = (args: Input) => Promise<Output>;

/**
 * Extracts the input type from a ServiceFn type.
 *
 * @template T - Service function type
 * @returns Input type of the service function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for type inference in generic constraints
export type InferServiceInput<T> = T extends ServiceFn<infer I, any> ? I : never;

/**
 * Extracts the output type from a ServiceFn type.
 *
 * @template T - Service function type
 * @returns Output type of the service function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for type inference in generic constraints
export type InferServiceOutput<T> = T extends ServiceFn<any, infer O> ? O : never;
