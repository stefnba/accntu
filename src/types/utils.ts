/**
 * Makes specified fields optional while keeping others required
 * @example
 * type User = { id: string; name: string; email: string; }
 * type UserWithOptionalEmail = PartialBy<User, 'email'> // { id: string; name: string; email?: string; }
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes all fields optional except the ones specified (which remain required)
 * @example
 * type User = { id: string; name: string; email: string; }
 * type UserWithRequiredId = RequiredBy<User, 'id'> // { id: string; name?: string; email?: string; }
 */
export type RequiredBy<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;

/**
 * Prettify a type for better readability. Forces TypeScript to expand object types
 */
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

/**
 * Extracts only required keys (non-optional) from a type
 */
export type ExtractRequiredKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];
