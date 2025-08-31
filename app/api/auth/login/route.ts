import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { Auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Get the database from the environment
        const db = new Database((request as any).env.DB);
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
