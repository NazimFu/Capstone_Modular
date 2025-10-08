import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export function generateJWT(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });
}

export function verifyJWT(token: string): { id: string } {
  return jwt.verify(token, JWT_SECRET) as { id: string };
}