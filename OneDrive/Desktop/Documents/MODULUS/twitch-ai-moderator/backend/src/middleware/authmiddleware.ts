import { Request, Response, NextFunction } from 'express';
import { verifyJWT as verify } from '../auth/jwt';

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  try {
    req.user = verify(token);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}