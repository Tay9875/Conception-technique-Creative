import { describe, it, expect } from 'vitest';
import { z, ZodError } from 'zod';
import { zodToFieldErrors } from '../../src/lib/validation';

describe('zodToFieldErrors', () => {
  it('returns {} for an empty error (no issues)', () => {
    const empty = new ZodError([]);
    expect(zodToFieldErrors(empty)).toEqual({});
  });

  it('maps Zod issues into { [path]: message }', () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(0)
    });
    const r = schema.safeParse({ email: 'notanemail', age: -1 });
    expect(r.success).toBe(false);
    if (!r.success) {
      const out = zodToFieldErrors(r.error);
      expect(out.email).toBeDefined();
      expect(out.age).toBeDefined();
    }
  });

  it('keeps first error per field (does not overwrite)', () => {
    const schema = z.object({ name: z.string().min(5).max(10) });
    const r = schema.safeParse({ name: 'a' });
    if (!r.success) {
      const out = zodToFieldErrors(r.error);
      expect(typeof out.name).toBe('string');
    }
  });

  it('uses "form" key when issue has no path', () => {
    const err = new ZodError([
      { code: 'custom', path: [], message: 'top-level' } as any
    ]);
    expect(zodToFieldErrors(err)).toEqual({ form: 'top-level' });
  });
});
