import { NextFunction, Request, Response } from 'express';

export const requireRole = (allowedRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Authentification requise.' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permissions insuffisantes.' });
    }
    return next();
  };
};
