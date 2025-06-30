import { Context } from 'hono';

/**
 * Gets the client IP address from various possible headers or sources
 * Handles proxies and common header variations
 *
 * @param c - Hono context
 * @returns The client IP address or 'unknown' if not found
 */
export const getClientIp = (c: Context): string => {
    return (
        c.req.header('x-forwarded-for') ||
        c.req.header('x-real-ip') ||
        c.req.raw.headers.get('x-forwarded-for') ||
        c.req.raw.headers.get('cf-connecting-ip') ||
        'unknown'
    )?.toString();
};

/**
 * Gets the user agent from the request headers
 *
 * @param c - Hono context
 * @returns The user agent string or undefined if not present
 */
export const getUserAgent = (c: Context): string | undefined => {
    return c.req.header('user-agent');
};

/**
 * Gets both client IP and user agent in a single function call
 * Useful when both are needed together (common case)
 *
 * @param c - Hono context
 * @returns Object containing ipAddress and userAgent
 */
export const getRequestMetadata = (c: Context): { ipAddress: string; userAgent?: string } => {
    return {
        ipAddress: getClientIp(c),
        userAgent: getUserAgent(c),
    };
};
