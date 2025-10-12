import { TAppLayer } from '@/types/app';
import { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * The layers that an error can be thrown in
 */
export type TErrorLayer = TAppLayer;

/**
 * The HTTP status codes
 */
export type THttpStatusCodeMapping = Record<string, ContentfulStatusCode>;
