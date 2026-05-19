import { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { PreferencesProvider } from '../../contexts/PreferencesContext';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: MemoryRouterProps['initialEntries'];
}

export function renderWithProviders(
  ui: ReactElement,
  { initialEntries = ['/'], ...options }: RenderWithProvidersOptions = {}
): RenderResult {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <PreferencesProvider>{ui}</PreferencesProvider>
    </MemoryRouter>,
    options
  );
}
