import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    console.error('BETTER_AUTH_SECRET is not configured in the environment variables.');
    return res.status(500).json({ error: 'Server authentication configuration error.' });
  }

  try {
    const decoded = jwt.verify(token, secret) as { id: string; email: string; name?: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
