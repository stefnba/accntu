import { alphabet, generateRandomString } from 'oslo/crypto';

/**
 * Generate a secure random token
 * @param length Length of the token in bytes (default: 32)
 * @returns Secure random token as hex string
 */
export const generateSecureToken = (length: number = 32): string => {
    return generateRandomString(length * 2, alphabet('a-z', 'A-Z', '0-9'));
};

/**
 * Check if a path matches a pattern with support for:
 * - Exact matches: '/api/auth/login'
 * - Wildcards: '/api/auth/*' (matches any path starting with '/api/auth/')
 * - Path parameters: '/api/auth/:provider/callback' (matches '/api/auth/github/callback', etc.)
 * - Exclusions in wildcards using ![...] syntax:
 *   - Single exclusion: '/api/auth/*![logout]'
 *   - Multiple exclusions: '/api/auth/*![logout, settings/profile]'
 *   - Full path exclusions: '/api/auth/*![/api/auth/logout]'
 *   - Mixed paths: '/api/auth/*![logout, /api/auth/settings/profile]'
 *   Note: Relative paths in exclusions are automatically prefixed with the base pattern path
 *
 * @param path The actual path to check
 * @param pattern The pattern to match against
 * @returns true if the path matches the pattern and doesn't match any exclusions
 */
export const matchPath = (path: string, pattern: string): boolean => {
    // Parse exclusions from pattern if it contains !
    let excludePatterns: string[] = [];
    let basePattern = pattern;

    if (pattern.includes('!')) {
        const [patternBase, exclusions] = pattern.split('![');
        if (exclusions) {
            basePattern = patternBase;
            // Remove trailing ] and split by comma
            const exclusionList = exclusions
                .replace(/\]$/, '')
                .split(',')
                .map((s) => s.trim());
            excludePatterns = exclusionList.map((exclude) => {
                // If exclude path doesn't start with /, prepend the base pattern's path
                if (!exclude.startsWith('/')) {
                    const basePath = basePattern.replace('/*', '');
                    return `${basePath}/${exclude}`;
                }
                return exclude;
            });
        }
    }

    // Check exclusions first
    if (excludePatterns.length > 0) {
        for (const exclude of excludePatterns) {
            if (matchPath(path, exclude)) {
                return false;
            }
        }
    }

    // Normalize paths by removing trailing slashes and ensuring leading slash
    const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
    const normalizedPattern =
        basePattern.endsWith('/') && basePattern !== '/' ? basePattern.slice(0, -1) : basePattern;

    // Handle wildcard at the end (e.g., '/api/auth/*')
    if (normalizedPattern.endsWith('/*')) {
        const prefix = normalizedPattern.slice(0, -2);

        // If the prefix contains path parameters, we need to check more carefully
        if (prefix.includes(':')) {
            // Extract the part before the wildcard
            const prefixSegments = prefix.split('/').filter(Boolean);
            const pathSegments = normalizedPath.split('/').filter(Boolean);

            // If path is shorter than prefix, it can't match
            if (pathSegments.length < prefixSegments.length) {
                return false;
            }

            // Check each segment of the prefix
            for (let i = 0; i < prefixSegments.length; i++) {
                const prefixSegment = prefixSegments[i];
                const pathSegment = pathSegments[i];

                // Skip path parameters
                if (prefixSegment.startsWith(':')) {
                    continue;
                }

                // Regular segment must match exactly
                if (prefixSegment !== pathSegment) {
                    return false;
                }
            }

            // If we got here, the prefix matches
            return true;
        }

        // Simple prefix check for patterns without path parameters
        return normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`);
    }

    // If no wildcards or params, do exact match
    if (!normalizedPattern.includes(':') && !normalizedPattern.includes('*')) {
        return normalizedPath === normalizedPattern;
    }

    // Split both paths into segments
    const pathSegments = normalizedPath.split('/').filter(Boolean);
    const patternSegments = normalizedPattern.split('/').filter(Boolean);

    // If different number of segments and not a wildcard pattern, no match
    if (pathSegments.length !== patternSegments.length) {
        return false;
    }

    // Check each segment
    for (let i = 0; i < patternSegments.length; i++) {
        const patternSegment = patternSegments[i];
        const pathSegment = pathSegments[i];

        // Handle path parameter (e.g., ':provider')
        if (patternSegment.startsWith(':')) {
            continue; // Path parameter matches any value
        }

        // Handle wildcard segment
        if (patternSegment === '*') {
            continue; // Wildcard matches any value
        }

        // Regular segment - must match exactly
        if (patternSegment !== pathSegment) {
            return false;
        }
    }

    return true;
};

/**
 * Check if a path matches any of the patterns
 *
 * @param path The path to check
 * @param patterns Array of patterns to match against
 * @returns true if the path matches any pattern
 */
export const isPathMatch = (path: string, patterns: string[] | readonly string[]): boolean => {
    return patterns.some((pattern) => matchPath(path, pattern));
};

/**
 * Check if a method and path match any of the patterns
 *
 * @param method The HTTP method to check
 * @param path The path to check
 * @param patterns Array of [method, path] patterns to match against
 * @returns true if the method and path match any pattern
 */
export const isMethodPathMatch = (
    method: string,
    path: string,
    patterns: Array<[string, string]>
): boolean => {
    return patterns.some(([patternMethod, patternPath]) => {
        return (patternMethod === '*' || patternMethod === method) && matchPath(path, patternPath);
    });
};
