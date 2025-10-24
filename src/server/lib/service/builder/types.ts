/**
 * Standard function signature for all service functions.
 * Services coordinate business logic and call query functions.
 *
 * @template Input - The input parameter type (defaults to unknown for strict typing)
 * @template Output - The return type (defaults to unknown for strict typing)
 */
export type ServiceFn<Input = unknown, Output = unknown> = (args: Input) => Promise<Output>;
