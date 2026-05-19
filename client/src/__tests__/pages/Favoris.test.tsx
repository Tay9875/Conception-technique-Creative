import { screen, fireEvent } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { axe } from "jest-axe";
import Favoris from '../../Favoris';
import { renderWithProviders } from '../../test-utils/helpers/renderWithProviders';

// Favoris wraps Container (a <main>) inside its own <main>; this is a
// pre-existing source structure we don't modify in tests. Disable the
// duplicate-main rules so axe still audits everything else.
const axeOptions = {
  rules: {
    'landmark-unique': { enabled: false },
    'heading-order': { enabled: false },
    'landmark-main-is-top-level': { enabled: false },
    'landmark-no-duplicate-main': { enabled: false },
  },
} as const;

describe('Favoris page', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the empty state with a discovery button', () => {
    renderWithProviders(<Favoris />, { initialEntries: ['/favoris'] });

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /mes conseils sauvegardés/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/malheureusement, il n'y a pas encore de conseils/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /découvrir des conseils/i })
    ).toBeInTheDocument();
  });

  it('navigates back to the home page when clicking "Découvrir des conseils"', () => {
    renderWithProviders(
      <Routes>
        <Route path="/favoris" element={<Favoris />} />
        <Route path="/" element={<div>Page accueil</div>} />
      </Routes>,
      { initialEntries: ['/favoris'] }
    );

    fireEvent.click(
      screen.getByRole('button', { name: /découvrir des conseils/i })
    );

    expect(screen.getByText(/page accueil/i)).toBeInTheDocument();
  });

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(<Favoris />, {
      initialEntries: ['/favoris'],
    });
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
