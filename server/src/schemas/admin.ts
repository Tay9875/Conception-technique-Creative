import { z } from 'zod';

export const createUserSchema = z.object({
  firstname: z.string().min(1).max(100),
  lastname: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(10).max(128),
  role_id: z.number().int().min(1)
});

export const updateRoleSchema = z.object({
  role_id: z.number().int().min(1)
});
