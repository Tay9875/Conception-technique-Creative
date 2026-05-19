import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, refreshSchema } from '../src/schemas/auth';

describe('auth schemas', () => {
  it('rejects invalid register', () => {
    const r = registerSchema.safeParse({ email: 'bad' });
    expect(r.success).toBe(false);
  });

  it('accepts valid register', () => {
    const r = registerSchema.safeParse({ firstname: 'A', lastname: 'B', email: 'a@b.com', password: '1234567890' });
    expect(r.success).toBe(true);
  });

  it('validates login/refresh', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
    expect(refreshSchema.safeParse({ refreshToken: 'toktoktok12' }).success).toBe(true);
  });
});
