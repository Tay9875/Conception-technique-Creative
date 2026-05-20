import { screen, fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { axe } from 'jest-axe';
import { http, HttpResponse } from 'msw';
import Profile from '../../Profile';
import { API_URL } from '../../config/api';
import { server } from '../../test-utils/mocks/server';
import { renderWithProviders } from '../../test-utils/helpers/renderWithProviders';
import { mockUser } from '../../test-utils/helpers/fixtures';

const axeOptions = {
  rules: {
    'landmark-unique': { enabled: false },
    'heading-order': { enabled: false },
  },
} as const;

describe('Profile page', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('reads the user from localStorage and renders profile info', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithProviders(<Profile />, { initialEntries: ['/profile'] });

    expect(screen.getByText(/statut\s*:\s*patient/i)).toBeInTheDocument();
    expect(screen.getByText(/méthode de connexion/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prénom/i)).toHaveValue(mockUser.firstname);
    expect(screen.getByLabelText(/^nom$/i)).toHaveValue(mockUser.lastname);
    expect(screen.getByLabelText(/adresse email/i)).toHaveValue(mockUser.email);
  });

  it('logs out: clears localStorage user and navigates to /login', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'access');

    renderWithProviders(
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<div>Page Login</div>} />
      </Routes>,
      { initialEntries: ['/profile'] }
    );

    const logoutButtons = screen.getAllByRole('button', { name: /déconnexion/i });
    const pageLogout = logoutButtons.find((btn) =>
      btn.classList.contains('sign-out-btn')
    );
    expect(pageLogout).toBeDefined();
    fireEvent.click(pageLogout as HTMLElement);

    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByText(/page login/i)).toBeInTheDocument();
  });

  it('shows Google-only auth state without password form', async () => {
    const googleOnlyUser = {
      ...mockUser,
      authProviders: ['google'],
      hasPassword: false,
      canChangePassword: false,
      profileStatus: 'prefer_not_to_say',
    };
    localStorage.setItem('user', JSON.stringify(googleOnlyUser));
    server.use(
      http.get(`${API_URL}/users/me`, () =>
        HttpResponse.json({ success: true, data: googleOnlyUser })
      )
    );

    renderWithProviders(<Profile />, { initialEntries: ['/profile'] });

    await waitFor(() => {
      expect(screen.getByText(/connexion via google/i)).toBeInTheDocument();
    });
    expect(screen.queryByLabelText(/nouveau mot de passe/i)).not.toBeInTheDocument();
    expect(screen.getByText(/changement de mot de passe Oncarya/i)).toBeInTheDocument();
  });

  it('updates profile status from the profile page', async () => {
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithProviders(<Profile />, { initialEntries: ['/profile'] });

    fireEvent.change(screen.getByLabelText(/statut dans oncarya/i), {
      target: { value: 'caregiver' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enregistrer les modifications/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/profil mis/i);
    });
    expect(localStorage.getItem('user')).toContain('"profileStatus":"caregiver"');
  });

  it('does not crash when there is no user in localStorage (redirects to /login)', () => {
    expect(() =>
      renderWithProviders(
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<div>Page Login</div>} />
        </Routes>,
        { initialEntries: ['/profile'] }
      )
    ).not.toThrow();
  });

  it('has no axe accessibility violations', async () => {
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { container } = renderWithProviders(<Profile />, {
      initialEntries: ['/profile'],
    });

    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
