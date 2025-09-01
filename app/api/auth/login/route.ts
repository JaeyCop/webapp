import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../lib/db';
import { Auth } from '../../../../lib/auth';
import { authRateLimiter } from '../../../../lib/rate-limiter';
import { Validator } from '../../../../lib/validation';
import { logger } from '../../../../lib/logger';
import { config } from '../../../../lib/config';

export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting
        const rateLimitResult = await authRateLimiter.isAllowed(request);
        if (!rateLimitResult.allowed) {
            logger.warn('Rate limit exceeded for login attempt', {
                ip: request.headers.get('CF-Connecting-IP') || 'unknown',
                resetTime: rateLimitResult.resetTime
            });

            return NextResponse.json(
                {
                    message: 'Too many login attempts. Please try again later.',
                    resetTime: rateLimitResult.resetTime
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': config.getRateLimit().auth.maxRequests.toString(),
                        'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
                        'X-RateLimit-Reset': rateLimitResult.resetTime?.toString() || '0'
                    }
                }
            );
        }

        const body = await request.json();
        const { email, password } = body;

        // Validate input
        const emailValidation = Validator.email(email);
        const passwordValidation = password ? { isValid: true, errors: [], sanitized: password } : { isValid: false, errors: ['Password is required'] };

        if (!emailValidation.isValid || !passwordValidation.isValid) {
            const errors = [...emailValidation.errors, ...passwordValidation.errors];
            logger.warn('Invalid login attempt', { email, errors });

            return NextResponse.json(
                { message: 'Invalid email or password format', errors },
                { status: 400 }
            );
        }

        // Get the database from the environment - handle both Cloudflare Workers and development
        let dbInstance;
        if (process.env.NODE_ENV === 'development') {
            // For development, we'll create a mock implementation or skip DB operations
            // In a real development setup, you'd connect to a local SQLite or development D1
            console.log('Development mode: simulating authentication');

            // Simple development authentication
            if (email === 'admin@example.com' && password === 'admin123') {
                return NextResponse.json({
                    token: 'dev-token-' + Date.now(),
                    user: {
                        id: 'dev-user-1',
                        email: 'admin@example.com',
                        name: 'Development Admin',
                        role: 'admin'
                    }
                });
            } else {
                return NextResponse.json(
                    { message: 'Invalid email or password' },
                    { status: 401 }
                );
            }
        } else if (process.env.DB) {
            // Development environment - use process.env
            dbInstance = process.env.DB as unknown;
        } else {
            // Cloudflare Workers environment
            dbInstance = (request as unknown as { env: { DB: unknown } }).env?.DB;
        }

        if (!dbInstance) {
            logger.error('Database not available');
            return NextResponse.json(
                { message: 'Database connection error' },
                { status: 500 }
            );
        }

        const db = new Database(dbInstance);
        const auth = new Auth(db);

        const result = await auth.authenticateUser(emailValidation.sanitized, passwordValidation.sanitized);

        if (!result) {
            logger.warn('Authentication failed', { email: emailValidation.sanitized });
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Successfully authenticated, clear rate limiter for this user/IP if needed, or just return success
        // For simplicity here, we're just returning success. A more robust system might track successful logins.

        return NextResponse.json({
            token: result.token,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role
            }
        });

    } catch (error) {
        logger.error('Login endpoint error', { error });
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}