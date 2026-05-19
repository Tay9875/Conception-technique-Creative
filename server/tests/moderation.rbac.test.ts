import { describe, it, expect } from 'vitest';
import { requireRole } from '../src/middleware/rbac';

const mockRes = () => {
  const res: any = {};
  res.status = (c: number) => { res.code = c; return res; };
  res.json = (b: unknown) => { res.body = b; return res; };
  return res;
};

describe('rbac middleware', () => {
  it('returns 401 when no user', () => {
    const req: any = {};
    const res = mockRes();
    let called = false;
    requireRole([3])(req, res as any, () => { called = true; });
    expect(res.code).toBe(401);
    expect(called).toBe(false);
  });

  it('returns 403 on forbidden role', () => {
    const req: any = { user: { role: 1 } };
    const res = mockRes();
    let called = false;
    requireRole([3])(req, res as any, () => { called = true; });
    expect(res.code).toBe(403);
    expect(called).toBe(false);
  });
});
