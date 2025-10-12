import { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * The layers that an error can be thrown in
 */
export type TErrorLayer =
    | 'ENDPOINT' // HTTP endpoints / handlers
    | 'SERVICE' // domain/service layer
    | 'DB' // direct DB client errors
    | 'QUERY' // direct DB client errors
    | 'INTEGRATION' // external APIs/SDKs
    | 'AUTH' // auth
    | 'INFRA' // queue, cache, storage
    | 'REPOSITORY' // repositories / data mappers
    | 'CONFIG'; // external APIs/SDKs

/**
 * The HTTP status codes
 */
export type THttpStatusCodeMapping = Record<string, ContentfulStatusCode>;
