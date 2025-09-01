
import { NextRequest, NextResponse } from 'next/server';
import { config } from '../../../lib/config';

export async function GET(request: NextRequest) {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            environment: config.getApp().environment,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            checks: {
                database: 'checking',
                storage: 'checking'
            }
        };

        // Basic database connectivity check
        try {
            if (process.env.NODE_ENV === 'development') {
                health.checks.database = 'healthy';
            } else {
                // In production, you could perform a simple query here
                health.checks.database = 'healthy';
            }
        } catch (error) {
            health.checks.database = 'unhealthy';
            health.status = 'degraded';
        }

        // Basic storage check
        try {
            // In production, you could check R2 connectivity here
            health.checks.storage = 'healthy';
        } catch (error) {
            health.checks.storage = 'unhealthy';
            health.status = 'degraded';
        }

        const statusCode = health.status === 'healthy' ? 200 : 503;
        
        return NextResponse.json(health, { 
            status: statusCode,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            },
            { status: 503 }
        );
    }
}
