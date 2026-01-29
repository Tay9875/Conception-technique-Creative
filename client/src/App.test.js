import { render, screen } from '@testing-library/react';
import App from './App';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

expect.extend(toHaveNoViolations);

test('renders learn react link', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const titleElement = screen.getByText(/connexion/i);
  expect(titleElement).toBeInTheDocument();
});

test('App should have no accessibility violations', async () => {
  const { container } = render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Teste que Auth s'affiche si aucun utilisateur n'est connecté
test('affiche Auth si utilisateur non connecté', () => {
  // On s'assure que localStorage est vide
  window.localStorage.removeItem('user');
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/connexion/i)).toBeInTheDocument();
});

// Teste que Feed s'affiche si utilisateur connecté
test('affiche Feed si utilisateur connecté', () => {
  const fakeUser = { firstname: 'Jean', lastname: 'Dupont', id: 1 };
  window.localStorage.setItem('user', JSON.stringify(fakeUser));
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/bonjour, jean/i)).toBeInTheDocument();
  // Nettoyage
  window.localStorage.removeItem('user');
});

// Teste la déconnexion (logout)
test('permet de se déconnecter', () => {
  const fakeUser = { firstname: 'Marie', lastname: 'Curie', id: 2 };
  window.localStorage.setItem('user', JSON.stringify(fakeUser));
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const logoutBtn = screen.getByRole('button', { name: /se déconnecter/i });
  logoutBtn.click();
  expect(screen.getByText(/connexion/i)).toBeInTheDocument();
  // Nettoyage
  window.localStorage.removeItem('user');
});
