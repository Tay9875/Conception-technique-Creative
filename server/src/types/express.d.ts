import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: number };
      requestId?: string;
    }
  }
}

export {};
