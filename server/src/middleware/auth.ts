import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const signAccessToken = (payload: { id: number; email: string; role: number }) => jwt.sign(payload, env.jwtSecret, { expiresIn: '15m' });
export const signRefreshToken = (payload: { id: number }) => jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: '30d' });

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentification requise.' });
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { id: number; email: string; role: number };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};
