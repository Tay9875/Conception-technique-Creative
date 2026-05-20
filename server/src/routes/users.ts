import { Router } from 'express';
import bcrypt from 'bcrypt';
import { requireAuth } from '../middleware/auth';
import { pool } from '../database/db';
import { getPublicUserById, PROFILE_STATUS_VALUES, toPublicUser } from '../auth/authService';
import { asyncHandler, HttpError, ok } from '../lib/http';
import { z } from 'zod';
import { zodToFieldErrors } from '../lib/validation';

export const usersRouter = Router();

const updateMeSchema = z.object({
  firstname: z.string().trim().min(1).max(100).optional(),
  lastname: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().max(255).optional(),
  profileStatus: z.enum(PROFILE_STATUS_VALUES).optional(),
  currentPassword: z.string().min(1).max(128).optional(),
  newPassword: z.string().min(10).max(128).optional()
}).refine((data) => !data.currentPassword || Boolean(data.newPassword), {
  path: ['newPassword'],
  message: 'Renseignez un nouveau mot de passe.'
});

usersRouter.get('/me', requireAuth, asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, 'UNAUTHORIZED', 'Authentification requise.');
  const user = await getPublicUserById(pool, req.user.id);
  if (!user) throw new HttpError(404, 'USER_NOT_FOUND', 'Utilisateur non trouve.');
  return ok(res, user);
}));

usersRouter.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, 'UNAUTHORIZED', 'Authentification requise.');

  const p = updateMeSchema.safeParse(req.body);
  if (!p.success) throw new HttpError(400, 'INVALID_PAYLOAD', 'Payload invalide', zodToFieldErrors(p.error));

  const [rows] = await pool.query(
    `SELECT u.id, u.firstname, u.lastname, u.email, u.password, u.role_id, u.avatar_url, u.email_verified, u.profile_status,
            EXISTS(SELECT 1 FROM oauth_accounts oa WHERE oa.user_id = u.id AND oa.provider = 'google') AS has_google
     FROM users u
     WHERE u.id = ?
     LIMIT 1`,
    [req.user.id]
  );
  const user = (rows as any[])[0];
  if (!user) throw new HttpError(404, 'USER_NOT_FOUND', 'Utilisateur non trouve.');

  const updates: string[] = [];
  const values: unknown[] = [];
  const { firstname, lastname, email, profileStatus, currentPassword, newPassword } = p.data;

  if (firstname !== undefined) {
    updates.push('firstname = ?');
    values.push(firstname);
  }
  if (lastname !== undefined) {
    updates.push('lastname = ?');
    values.push(lastname);
  }
  if (profileStatus !== undefined) {
    updates.push('profile_status = ?');
    values.push(profileStatus);
  }

  const normalizedEmail = email?.toLowerCase();
  if (normalizedEmail && normalizedEmail !== user.email) {
    updates.push('email = ?', 'email_verified = 0');
    values.push(normalizedEmail);
  }

  if (newPassword) {
    if (!user.password) {
      throw new HttpError(
        409,
        'PASSWORD_NOT_AVAILABLE',
        'Votre compte utilise Google pour la connexion. Aucun mot de passe Oncarya n’est configuré.'
      );
    }

    if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new HttpError(401, 'INVALID_CURRENT_PASSWORD', 'Mot de passe actuel incorrect.');
    }

    updates.push('password = ?');
    values.push(await bcrypt.hash(newPassword, 12));
  }

  if (!updates.length) {
    return ok(res, toPublicUser(user));
  }

  values.push(req.user.id);
  try {
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'EMAIL_TAKEN', 'Cet email est déjà utilisé.');
    }
    throw error;
  }

  const updatedUser = await getPublicUserById(pool, req.user.id);
  if (!updatedUser) throw new HttpError(404, 'USER_NOT_FOUND', 'Utilisateur non trouve.');
  return ok(res, updatedUser);
}));
