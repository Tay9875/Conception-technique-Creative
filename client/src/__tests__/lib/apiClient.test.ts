import { apiFetch, ApiError } from '../../lib/apiClient';

function mockFetchResponse(body: unknown, init: { status?: number; ok?: boolean } = {}) {
  const status = init.status ?? 200;
  return {
    ok: init.ok ?? (status >= 200 && status < 300),
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('apiFetch', () => {
  const originalFetch = globalThis.fetch;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns the unwrapped data field on success', async () => {
    fetchSpy.mockResolvedValue(mockFetchResponse({ success: true, data: { value: 42 } }));
    const result = await apiFetch<{ value: number }>('http://localhost/api/sample');
    expect(result).toEqual({ value: 42 });
  });

  it('returns the raw payload when no data envelope is present', async () => {
    fetchSpy.mockResolvedValue(mockFetchResponse([1, 2, 3]));
    const result = await apiFetch<number[]>('http://localhost/api/raw');
    expect(result).toEqual([1, 2, 3]);
  });

  it('throws an ApiError with the server message and details when response is not ok', async () => {
    fetchSpy.mockResolvedValue(
      mockFetchResponse(
        {
          success: false,
          error: { code: 'INVALID', message: 'Email invalide', details: { email: 'required' } },
        },
        { status: 400 }
      )
    );

    const promise = apiFetch('http://localhost/api/fail', { method: 'POST' });
    await expect(promise).rejects.toMatchObject({
      status: 400,
      message: 'Email invalide',
      details: { email: 'required' },
    });
  });

  it('falls back to a generic message when the error body is empty', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error('no body')),
    } as unknown as Response);

    const promise = apiFetch('http://localhost/api/empty');
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      status: 500,
      message: 'Une erreur est survenue.',
    });
  });

  it('forwards method, headers and body to fetch', async () => {
    fetchSpy.mockResolvedValue(mockFetchResponse({ success: true, data: { id: 1 } }, { status: 201 }));

    await apiFetch<{ id: number }>('http://localhost/api/echo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
      body: JSON.stringify({ hello: 'world' }),
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost/api/echo',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ hello: 'world' }) })
    );
  });
});

describe('ApiError', () => {
  it('exposes status and details', () => {
    const err = new ApiError(409, 'Conflict', { reason: 'duplicate' });
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(409);
    expect(err.message).toBe('Conflict');
    expect(err.details).toEqual({ reason: 'duplicate' });
  });
});
