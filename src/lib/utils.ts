import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Type-safe wrapper for Object.entries
 *
 * This function provides better type inference for Object.entries,
 * returning a properly typed array of [key, value] tuples.
 *
 * @param obj - The object to get entries from
 * @returns A properly typed array of [key, value] tuples
 */
export function typedEntries<T extends object>(obj: T): Array<[keyof T, T[keyof T]]> {
    return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Type-safe wrapper for Object.fromEntries with uniform value types
 *
 * This function provides better type inference for Object.fromEntries,
 * preserving the key types and ensuring uniform value types across all keys.
 * Use this when all values in the resulting object have the same type.
 *
 * @param entries - A typed array of [key, value] tuples
 * @returns A properly typed object constructed from the entries
 */
export function typedFromEntries<K extends PropertyKey, V>(
    entries: ReadonlyArray<readonly [K, V]>
): Record<K, V> {
    return Object.fromEntries(entries) as Record<K, V>;
}

/**
 * Type-safe wrapper for Object.keys
 *
 * This function provides better type inference for Object.keys,
 * returning a properly typed array of keys.
 *
 * @param obj - The object to get keys from
 * @returns A properly typed array of keys
 */
export function typedKeys<T extends object>(obj: T): Array<keyof T> {
    return Object.keys(obj) as Array<keyof T>;
}
