import { NextResponse } from 'next/server';
import { db } from '@/server/db';

/**
 * Health check endpoint for Docker containers and monitoring
 * Returns 200 OK if the application is healthy, 500 if not
 */
export async function GET() {
    try {
        // Check database connectivity
        await db.execute('SELECT 1');
        
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            version: process.env.npm_package_version || '1.0.0',
            services: {
                database: 'connected',
                application: 'running'
            }
        };

        return NextResponse.json(healthStatus, { status: 200 });
    } catch (error) {
        const errorStatus = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
            services: {
                database: 'disconnected',
                application: 'running'
            }
        };

        return NextResponse.json(errorStatus, { status: 500 });
    }
}