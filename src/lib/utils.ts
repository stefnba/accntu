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
