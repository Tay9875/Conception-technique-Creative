import { screen, waitFor, fireEvent } from '@testing-library/react';
import { axe } from "jest-axe";
import Auth from '../../Auth';
import { renderWithProviders } from '../../test-utils/helpers/renderWithProviders';
import { mockLoginResponse } from '../../test-utils/helpers/fixtures';

const axeOptions = {
  rules: {
    'landmark-unique': { enabled: false },
    'heading-order': { enabled: false },
  },
} as const;

const successResponse = (data: unknown) => ({
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue({ success: true, data }),
}) as unknown as Response;

const failureResponse = (status: number, message: string) => ({
  ok: false,
  status,
  json: vi
    .fn()
    .mockResolvedValue({ success: false, error: { message } }),
}) as unknown as Response;

describe('Auth page', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
    localStorage.clear();
    window.history.pushState(null, '', '/');
  });

  it('renders the login form by default', () => {
    renderWithProviders(<Auth />, { initialEntries: ['/login'] });

    expect(
      screen.getByRole('heading', { level: 1, name: /connexion/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuer avec google/i })).toBeInTheDocument();
  });

  it('toggles to the register form', () => {
    renderWithProviders(<Auth />, { initialEntries: ['/login'] });

    fireEvent.click(screen.getByRole('button', { name: /créer un compte/i }));

    expect(
      screen.getByRole('heading', { level: 1, name: /rejoindre oncarya/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^nom$/i)).toBeInTheDocument();
  });

  it('calls onLoginSuccess and stores tokens on a successful login', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(successResponse(mockLoginResponse)) as unknown as typeof fetch;

    const onLoginSuccess = vi.fn();
    renderWithProviders(<Auth onLoginSuccess={onLoginSuccess} />, {
      initialEntries: ['/login'],
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledWith(mockLoginResponse.user);
    });

    expect(localStorage.getItem('user')).toEqual(
      JSON.stringify(mockLoginResponse.user)
    );
    expect(localStorage.getItem('token')).toBe(mockLoginResponse.token);
    expect(localStorage.getItem('refreshToken')).toBe(
      mockLoginResponse.refreshToken
    );
  });

  it('shows an error message when login fails', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        failureResponse(401, 'Mauvais email')
      ) as unknown as typeof fetch;

    renderWithProviders(<Auth />, { initialEntries: ['/login'] });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'badpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/mauvais email/i);
    });
  });

  it('finalizes a Google OAuth callback from the URL fragment', async () => {
    const encodedUser = btoa(JSON.stringify(mockLoginResponse.user))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    window.history.pushState(
      null,
      '',
      `/login#oauth=success&token=google.access&refreshToken=google.refresh&user=${encodedUser}&returnTo=/feed`
    );

    const onLoginSuccess = vi.fn();
    renderWithProviders(<Auth onLoginSuccess={onLoginSuccess} />, {
      initialEntries: ['/login'],
    });

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledWith(mockLoginResponse.user);
    });
    expect(localStorage.getItem('token')).toBe('google.access');
    expect(localStorage.getItem('refreshToken')).toBe('google.refresh');
  });

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(<Auth />, {
      initialEntries: ['/login'],
    });

    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
