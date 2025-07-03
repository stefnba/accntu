import type { z, ZodIssue } from 'zod';

/**
 * Constructs readable error messages from Zod validation issues
 */
export function constructZodErrorMessages(errors: ZodIssue[]): string[] {
    return errors.map((error, idx) => {
        return `${idx + 1}) ${error.path.join('.')}: ${error.message}`;
    });
}

export interface FieldError {
    path: (string | number)[];
    message: string;
    value: any;
}

/**
 * A utility to safely retrieve a value from a nested object based on a path array.
 * @param obj - The object to retrieve the value from.
 * @param path - An array of keys representing the path to the value.
 * @returns The value if found, otherwise undefined.
 */
function getValueFromPath(obj: any, path: (string | number)[]): any {
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
