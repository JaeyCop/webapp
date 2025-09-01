import { NextRequest, NextResponse } from 'next/server';
import { EnhancedDatabase as Database } from '@/lib/db_enhanced';
import { Auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const email = (body as { email?: string }).email;
        const password = (body as { password?: string }).password;

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Get the database from the environment - handle both Cloudflare Workers and development
        let dbInstance;
        if (process.env.DB) {
            // Development environment - use process.env
            dbInstance = process.env.DB as unknown;
        } else {
            // Cloudflare Workers environment
            dbInstance = (request as unknown as { env: { DB: unknown } }).env?.DB;
        }

        if (!dbInstance) {
            console.error('Database not available');
            return NextResponse.json(
                { message: 'Database connection error' },
                { status: 500 }
            );
        }

        const db = new Database(dbInstance);
        const auth = new Auth(db);

        const result = await auth.authenticateUser(email, password);

        if (!result) {
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            );
        }

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
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
