import { z } from 'zod';
import type { TPublicErrorCode } from './public';
import { getAllPublicErrorCodes } from './utils';

/**
 * Schema for the public error codes
 */
export const PublicErrorCodesSchema = z.enum(
    getAllPublicErrorCodes() as [TPublicErrorCode, ...TPublicErrorCode[]]
);
