import { act, renderHook } from '@testing-library/react';
import { PreferencesProvider, usePreferences } from '../../contexts/PreferencesContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PreferencesProvider>{children}</PreferencesProvider>
);

describe('PreferencesContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
    document.documentElement.style.removeProperty('--font-size-base');
  });

  it('initializes with sensible defaults', () => {
    const { result } = renderHook(() => usePreferences(), { wrapper });
    expect(result.current.dyslexicFont).toBe(false);
    expect(result.current.fontSize).toBe(16);
    expect(result.current.highContrast).toBe(false);
  });

  it('reads existing preferences from localStorage', () => {
    localStorage.setItem('dyslexicFont', JSON.stringify(true));
    localStorage.setItem('fontSize', JSON.stringify(20));
    localStorage.setItem('highContrast', JSON.stringify(true));

    const { result } = renderHook(() => usePreferences(), { wrapper });
    expect(result.current.dyslexicFont).toBe(true);
    expect(result.current.fontSize).toBe(20);
    expect(result.current.highContrast).toBe(true);
  });

  it('toggles dyslexic font and persists the change', () => {
    const { result } = renderHook(() => usePreferences(), { wrapper });
    act(() => result.current.toggleDyslexicFont());
    expect(result.current.dyslexicFont).toBe(true);
    expect(localStorage.getItem('dyslexicFont')).toBe('true');
    expect(document.body.classList.contains('dyslexic-font')).toBe(true);
  });

  it('increases font size up to the maximum (24)', () => {
    const { result } = renderHook(() => usePreferences(), { wrapper });
    for (let i = 0; i < 10; i++) {
      act(() => result.current.increaseFontSize());
    }
    expect(result.current.fontSize).toBe(24);
    expect(document.documentElement.style.getPropertyValue('--font-size-base')).toBe('24px');
  });

  it('decreases font size down to the minimum (12)', () => {
    const { result } = renderHook(() => usePreferences(), { wrapper });
    for (let i = 0; i < 10; i++) {
      act(() => result.current.decreaseFontSize());
    }
    expect(result.current.fontSize).toBe(12);
  });

  it('toggles high contrast and applies the body class', () => {
    const { result } = renderHook(() => usePreferences(), { wrapper });
    act(() => result.current.toggleHighContrast());
    expect(result.current.highContrast).toBe(true);
    expect(document.body.classList.contains('high-contrast')).toBe(true);
  });

  it('throws when usePreferences is called outside the provider', () => {
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => usePreferences())).toThrow(/PreferencesProvider/);
    consoleErr.mockRestore();
  });
});
