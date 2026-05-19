describe('API_URL config', () => {
  const ORIGINAL = import.meta.env.VITE_API_URL;

  afterEach(() => {
    if (ORIGINAL === undefined) {
      delete (import.meta.env as Record<string, unknown>).VITE_API_URL;
    } else {
      (import.meta.env as Record<string, unknown>).VITE_API_URL = ORIGINAL;
    }
    vi.resetModules();
  });

  async function loadApiUrl(): Promise<string> {
    vi.resetModules();
    const mod = await import('../../config/api');
    return mod.API_URL;
  }

  it('uses /api when VITE_API_URL is not set', async () => {
    delete (import.meta.env as Record<string, unknown>).VITE_API_URL;
    expect(await loadApiUrl()).toBe('/api');
  });

  it('uses /api when VITE_API_URL is empty or whitespace', async () => {
    (import.meta.env as Record<string, unknown>).VITE_API_URL = '   ';
    expect(await loadApiUrl()).toBe('/api');
  });

  it('uses the configured value when VITE_API_URL is set', async () => {
    (import.meta.env as Record<string, unknown>).VITE_API_URL = 'https://api.example.com/v1';
    expect(await loadApiUrl()).toBe('https://api.example.com/v1');
  });

  it('trims surrounding whitespace from the env var', async () => {
    (import.meta.env as Record<string, unknown>).VITE_API_URL = '  https://api.example.com  ';
    expect(await loadApiUrl()).toBe('https://api.example.com');
  });
});
