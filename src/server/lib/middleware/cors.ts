import { cors } from 'hono/cors';
import type { MiddlewareHandler, Context } from 'hono';

type CorsOriginFunction = (origin: string, c: Context) => string | null | undefined;

const getCorsConfig = () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Development: Allow localhost variations
    const developmentOrigins = [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        appUrl
    ];

    // Production: Strict origin control
    const productionOrigins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : [appUrl];

    const allowedOrigins = isDevelopment ? developmentOrigins : productionOrigins;

    return {
        origin: (origin: string, _c: Context) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return origin;
            
            // Check if origin is in allowed list
            return allowedOrigins.includes(origin) ? origin : null;
        },
        credentials: true, // Allow cookies and auth headers
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'Cache-Control',
            'X-CSRF-Token',
            'X-Forwarded-For',
            'User-Agent'
        ],
        exposeHeaders: [
            'X-Total-Count',
            'X-Page-Count', 
            'X-Rate-Limit-Remaining',
            'X-Rate-Limit-Reset'
        ],
        maxAge: 86400, // 24 hours for preflight cache
    };
};

export const corsMiddleware: MiddlewareHandler = cors(getCorsConfig());

export default corsMiddleware;