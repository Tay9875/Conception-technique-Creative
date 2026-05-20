import { afterAll, afterEach, beforeAll, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { toHaveNoViolations } from 'jest-axe';
import { server } from './test-utils/mocks/server';

// Node 25 ships an experimental localStorage that is unusable here and shadows
// jsdom's implementation. Force a small in-memory Storage polyfill so test code
// (and component effects) can call setItem/getItem/clear reliably.
class MemoryStorage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

function installStorage(name: 'localStorage' | 'sessionStorage') {
  const current = (globalThis as any)[name];
  if (!current || typeof current.clear !== 'function') {
    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: storage,
    });
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, name, {
        configurable: true,
        value: storage,
      });
    }
  }
}

installStorage('localStorage');
installStorage('sessionStorage');

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: MockResizeObserver,
  });
}

expect.extend(toHaveNoViolations);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
