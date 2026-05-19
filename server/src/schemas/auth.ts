import { z } from 'zod';

export const registerSchema = z.object({ firstname: z.string().min(1).max(100), lastname: z.string().min(1).max(100), email: z.string().email(), password: z.string().min(10).max(128) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const refreshSchema = z.object({ refreshToken: z.string().min(10) });
