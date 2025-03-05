import { describe, expect, it } from 'vitest';
import { isMethodPathMatch, isPathMatch, matchPath } from './utils';

describe('Path Matching Utilities', () => {
    describe('matchPath', () => {
        it('should match exact paths', () => {
            expect(matchPath('/api/auth/login', '/api/auth/login')).toBe(true);
            expect(matchPath('/api/auth/login', '/api/auth/logout')).toBe(false);
        });

        it('should handle trailing slashes', () => {
            expect(matchPath('/api/auth/login', '/api/auth/login/')).toBe(true);
            expect(matchPath('/api/auth/login/', '/api/auth/login')).toBe(true);
        });

        it('should match wildcard patterns', () => {
            expect(matchPath('/api/auth/login', '/api/auth/*')).toBe(true);
            expect(matchPath('/api/user/profile', '/api/auth/*')).toBe(false);
            expect(matchPath('/api/auth/login/refresh', '/api/auth/*')).toBe(true);
        });

        it('should match path parameters', () => {
            expect(matchPath('/api/user/123', '/api/user/:id')).toBe(true);
            expect(matchPath('/api/product/abc', '/api/user/:id')).toBe(false);
            expect(matchPath('/api/user/123/profile', '/api/user/:id/profile')).toBe(true);
        });

        it('should match complex patterns', () => {
            expect(matchPath('/api/user/123/posts/456', '/api/user/:userId/posts/:postId')).toBe(
                true
            );
            expect(matchPath('/api/user/123/comments', '/api/user/:userId/*')).toBe(true);
        });
    });

    describe('isPathMatch', () => {
        it('should match if path matches any pattern', () => {
            const patterns = ['/api/auth/login', '/api/auth/logout', '/api/health'];
            expect(isPathMatch('/api/auth/login', patterns)).toBe(true);
            expect(isPathMatch('/api/auth/register', patterns)).toBe(false);
        });

        it('should work with wildcard patterns', () => {
            const patterns = ['/api/public/*', '/api/health'];
            expect(isPathMatch('/api/public/data', patterns)).toBe(true);
            expect(isPathMatch('/api/private/data', patterns)).toBe(false);
        });
    });

    describe('isMethodPathMatch', () => {
        it('should match method and path', () => {
            const methodPatterns: Array<[string, string]> = [
                ['GET', '/api/products'],
                ['POST', '/api/auth/*'],
            ];

            expect(isMethodPathMatch('GET', '/api/products', methodPatterns)).toBe(true);
            expect(isMethodPathMatch('POST', '/api/products', methodPatterns)).toBe(false);
            expect(isMethodPathMatch('POST', '/api/auth/login', methodPatterns)).toBe(true);
            expect(isMethodPathMatch('GET', '/api/auth/login', methodPatterns)).toBe(false);
        });
    });
});
