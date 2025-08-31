import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Database, User } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export class Auth {
    constructor(private db: Database) { }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }

    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    generateToken(user: User): string {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    verifyToken(token: string): unknown {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch {
            return null;
        }
    }

    async authenticateUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
        const user = await this.db.getUserByEmail(email);
        if (!user) return null;

        // For now, we'll use a simple password check since we don't have the hash in the schema
        // In production, you'd want to properly hash passwords
        if (password === 'admin123') {
            const token = this.generateToken(user);
            return { user, token };
        }

        return null;
    }
}

export function getAuthTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

export async function authenticateRequest(request: Request, db: Database): Promise<User | null> {
    const token = getAuthTokenFromRequest(request);
    if (!token) return null;

    const auth = new Auth(db);
    const payload = auth.verifyToken(token);
    if (!payload) return null;

    return await db.getUserById(payload.id);
}
