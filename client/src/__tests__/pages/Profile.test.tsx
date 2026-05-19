import { screen, fireEvent } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { axe } from "jest-axe";
import Profile from '../../Profile';
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

    // Status line includes the role label (Patient for role_id=1)
    expect(screen.getByText(/statut\s*:\s*patient/i)).toBeInTheDocument();
    // ProfileForm pre-fills inputs with the user data
    expect(screen.getByLabelText(/prénom/i)).toHaveValue(mockUser.firstname);
    expect(screen.getByLabelText(/^nom$/i)).toHaveValue(mockUser.lastname);
    expect(screen.getByLabelText(/adresse email/i)).toHaveValue(mockUser.email);
  });

  it('logs out: clears localStorage user and navigates to /login', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithProviders(
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<div>Page Login</div>} />
      </Routes>,
      { initialEntries: ['/profile'] }
    );

    // Header also renders a "Déconnexion" button when a user is logged in, so
    // we explicitly target the page-level logout button (sign-out-btn class).
    const logoutButtons = screen.getAllByRole('button', { name: /déconnexion/i });
    const pageLogout = logoutButtons.find((btn) =>
      btn.classList.contains('sign-out-btn')
    );
    expect(pageLogout).toBeDefined();
    fireEvent.click(pageLogout as HTMLElement);

    expect(localStorage.getItem('user')).toBeNull();
    expect(screen.getByText(/page login/i)).toBeInTheDocument();
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
