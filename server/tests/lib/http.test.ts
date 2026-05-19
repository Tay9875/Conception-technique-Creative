import { describe, it, expect, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { HttpError, ok, fail, asyncHandler } from '../../src/lib/http';

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn((c: number) => { res.statusCode = c; return res; });
  res.json = vi.fn((b: unknown) => { res.body = b; return res; });
  return res as Response & { statusCode?: number; body?: unknown };
};

describe('HttpError', () => {
  it('carries status/code/message/details', () => {
    const err = new HttpError(418, 'TEAPOT', 'I am a teapot', { detail: 'yes' });
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(418);
    expect(err.code).toBe('TEAPOT');
    expect(err.message).toBe('I am a teapot');
    expect(err.details).toEqual({ detail: 'yes' });
  });

  it('details may be undefined', () => {
    const err = new HttpError(400, 'BAD', 'bad');
    expect(err.details).toBeUndefined();
  });
});

describe('ok()', () => {
  it('sends 200 with { success, data } by default', () => {
    const res = mockRes();
    ok(res as any, { foo: 'bar' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { foo: 'bar' } });
  });

  it('honors explicit status code', () => {
    const res = mockRes();
    ok(res as any, { id: 1 }, 201);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 1 } });
  });
});

describe('fail()', () => {
  it('sends success: false envelope with code/message/details', () => {
    const res = mockRes();
    fail(res as any, 400, 'BAD', 'Invalid', { field: 'x' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: { code: 'BAD', message: 'Invalid', details: { field: 'x' } } });
  });

  it('omits details param as undefined when not provided', () => {
    const res = mockRes();
    fail(res as any, 500, 'OOPS', 'Boom');
    expect(res.json).toHaveBeenCalledWith({ success: false, error: { code: 'OOPS', message: 'Boom', details: undefined } });
  });
});

describe('asyncHandler()', () => {
  it('forwards rejections to next()', async () => {
    const error = new Error('async failed');
    const handler = asyncHandler(async () => { throw error; });
    const next: NextFunction = vi.fn();
    handler({} as Request, {} as Response, next);
    await new Promise((r) => setImmediate(r));
    expect(next).toHaveBeenCalledWith(error);
  });

  it('does not call next() when handler resolves', async () => {
    const handler = asyncHandler(async () => undefined);
    const next: NextFunction = vi.fn();
    handler({} as Request, {} as Response, next);
    await new Promise((r) => setImmediate(r));
    expect(next).not.toHaveBeenCalled();
  });
});
