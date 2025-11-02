import { typedKeys } from '@/lib/utils';
import { SYSTEM_FIELDS, SystemTableFieldKeys } from '@/server/lib/db/table/system-fields';

/**
 * Utility function to create a mask of system fields. Useful for zod pick/omit.
 * @returns A record of system fields with their values set to true.
 */
export const fieldsToMask = () => {
    return typedKeys(SYSTEM_FIELDS).reduce(
        (acc, field) => {
            acc[field] = true;
            return acc;
        },
        {} as Record<SystemTableFieldKeys, true>
    );
};
