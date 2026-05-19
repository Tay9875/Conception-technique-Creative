import { fireEvent, screen } from '@testing-library/react';
import { Header } from '../../components/Header';
import { renderWithProviders } from '../../test-utils/helpers/renderWithProviders';
import { mockSessionUser } from '../../test-utils/helpers/fixtures';

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the logo and primary navigation links', () => {
    renderWithProviders(<Header theme="light" setTheme={vi.fn()} />);

    expect(screen.getByLabelText('Accueil')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accueil/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mes notes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mes articles/i })).toBeInTheDocument();
  });

  it('renders the "Connexion" button when no user is in localStorage', () => {
    renderWithProviders(<Header theme="light" setTheme={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Connexion/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Déconnexion/i })
    ).not.toBeInTheDocument();
  });

  it('renders profile and logout buttons when a user is stored', () => {
    localStorage.setItem('user', JSON.stringify(mockSessionUser));
    renderWithProviders(<Header theme="light" setTheme={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Mon profil/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Déconnexion/i })).toBeInTheDocument();
    // "Connexion" is a substring of "Déconnexion", so anchor the regex.
    expect(screen.queryByRole('button', { name: /^Connexion$/i })).not.toBeInTheDocument();
  });

  it('toggles the theme to "dark" when light is active', () => {
    const setTheme = vi.fn();
    renderWithProviders(<Header theme="light" setTheme={setTheme} />);

    const themeBtn = screen.getByRole('button', {
      name: /Activer le mode sombre/i,
    });
    fireEvent.click(themeBtn);

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('toggles the theme to "light" when dark is active', () => {
    const setTheme = vi.fn();
    renderWithProviders(<Header theme="dark" setTheme={setTheme} />);

    const themeBtn = screen.getByRole('button', {
      name: /Activer le mode clair/i,
    });
    fireEvent.click(themeBtn);

    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
