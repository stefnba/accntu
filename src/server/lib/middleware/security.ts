import type { MiddlewareHandler } from 'hono';

interface SecurityConfig {
    isDevelopment: boolean;
    appUrl: string;
    allowedOrigins: string[];
}

const getSecurityConfig = (): SecurityConfig => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : [appUrl];

    return {
        isDevelopment,
        appUrl,
        allowedOrigins,
    };
};

export const securityHeaders: MiddlewareHandler = async (c, next) => {
    const config = getSecurityConfig();
    
    await next();

    // Content Security Policy - Strict policy with Next.js compatibility
    const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-inline/unsafe-eval
        "style-src 'self' 'unsafe-inline'", // Tailwind and Next.js require unsafe-inline
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https:",
        "media-src 'self'",
        "object-src 'none'",
        "child-src 'none'",
        "worker-src 'self' blob:",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "base-uri 'self'",
        "upgrade-insecure-requests"
    ];

    // In development, allow additional sources for hot reload
    if (config.isDevelopment) {
        cspDirectives[1] = "script-src 'self' 'unsafe-eval' 'unsafe-inline' localhost:* ws: wss:";
        cspDirectives[4] = "connect-src 'self' https: ws: wss: localhost:*";
    }

    // HTTP Strict Transport Security - Only in production with HTTPS
    if (!config.isDevelopment && config.appUrl.startsWith('https://')) {
        c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Security Headers
    c.header('Content-Security-Policy', cspDirectives.join('; '));
    c.header('X-Frame-Options', 'DENY');
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('X-DNS-Prefetch-Control', 'off');
    c.header('X-Download-Options', 'noopen');
    c.header('X-Permitted-Cross-Domain-Policies', 'none');
    
    // Permissions Policy - Restrict sensitive browser features
    const permissionsPolicyDirectives = [
        'accelerometer=()',
        'ambient-light-sensor=()',
        'autoplay=()',
        'battery=()',
        'camera=()',
        'cross-origin-isolated=()',
        'display-capture=()',
        'document-domain=()',
        'encrypted-media=()',
        'execution-while-not-rendered=()',
        'execution-while-out-of-viewport=()',
        'fullscreen=(self)',
        'geolocation=()',
        'gyroscope=()',
        'keyboard-map=()',
        'magnetometer=()',
        'microphone=()',
        'midi=()',
        'navigation-override=()',
        'payment=()',
        'picture-in-picture=()',
        'publickey-credentials-get=(self)',
        'screen-wake-lock=()',
        'sync-xhr=()',
        'usb=()',
        'web-share=()',
        'xr-spatial-tracking=()'
    ];
    
    c.header('Permissions-Policy', permissionsPolicyDirectives.join(', '));

    // Remove server identification headers
    c.header('Server', '');
    c.header('X-Powered-By', '');
};

export default securityHeaders;