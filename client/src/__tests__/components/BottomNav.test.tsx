import { screen } from '@testing-library/react';
import BottomNav from '../../components/BottomNav';
import { renderWithProviders } from '../../test-utils/helpers/renderWithProviders';

describe('BottomNav', () => {
  it('renders a navigation landmark with the expected aria-label', () => {
    renderWithProviders(<BottomNav />);
    expect(
      screen.getByRole('navigation', { name: 'Navigation principale mobile' })
    ).toBeInTheDocument();
  });

  it('renders 5 navigation links', () => {
    renderWithProviders(<BottomNav />);
    const nav = screen.getByRole('navigation', { name: 'Navigation principale mobile' });
    const links = nav.querySelectorAll('a');
    expect(links).toHaveLength(5);
  });

  it('renders each label visibly (or visually hidden for the main action)', () => {
    renderWithProviders(<BottomNav />);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Partager un contenu')).toBeInTheDocument();
    expect(screen.getByText('Mes Articles')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
  });

  it('points each link to the expected route', () => {
    renderWithProviders(<BottomNav />);
    expect(screen.getByRole('link', { name: /Accueil/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Notes/i })).toHaveAttribute('href', '/notes');
    expect(screen.getByRole('link', { name: /Partager un contenu/i })).toHaveAttribute(
      'href',
      '/feed'
    );
    expect(screen.getByRole('link', { name: /Mes Articles/i })).toHaveAttribute(
      'href',
      '/mes_articles'
    );
    expect(screen.getByRole('link', { name: /Profil/i })).toHaveAttribute('href', '/profile');
  });
});
