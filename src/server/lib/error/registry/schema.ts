import { z } from 'zod';
import type { TPublicErrorCodes } from './public';
import { PublicErrorCodes } from './utils';

/**
 * Schema for the public error codes
 */
export const PublicErrorCodesSchema = z.enum(
    PublicErrorCodes as readonly [TPublicErrorCodes, ...TPublicErrorCodes[]]
);
