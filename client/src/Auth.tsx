import { useEffect, useRef, useState, ChangeEvent, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Auth.css';
import { SquareButton } from './components/SquareButton';
import { API_URL } from './config/api';
import { apiFetch, ApiError } from './lib/apiClient';
import type { LoginResponse, RegisterResponse, SessionUser } from './types';

interface AuthProps {
  onLoginSuccess?: (user: SessionUser) => void;
}

interface AuthFormState {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role_id: string;
}

interface LocationState {
  from?: unknown;
}

const initialForm: AuthFormState = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  role_id: '1',
};

const getInternalReturnTo = (from: unknown): string => {
  if (typeof from === 'string' && from.startsWith('/')) {
    return from;
  }

  if (from && typeof from === 'object') {
    const candidate = from as { pathname?: unknown; search?: unknown };
    if (typeof candidate.pathname === 'string' && candidate.pathname.startsWith('/')) {
      return `${candidate.pathname}${typeof candidate.search === 'string' ? candidate.search : ''}`;
    }
  }

  return '/';
};

export default function Auth({ onLoginSuccess }: AuthProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState<AuthFormState>(initialForm);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [isLogin]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    if (params.get('oauth') !== 'success') {
      const search = new URLSearchParams(location.search);
      if (search.get('oauth') === 'error') {
        setError('Connexion Google interrompue. Vous pouvez reessayer ou utiliser votre email.');
      }
      return;
    }

    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    const encodedUser = params.get('user');
    if (!token || !refreshToken || !encodedUser) {
      setError('Connexion Google incomplete. Veuillez reessayer.');
      return;
    }

    try {
      const base64 = encodedUser.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const oauthUser = JSON.parse(atob(padded)) as SessionUser;
      localStorage.setItem('user', JSON.stringify(oauthUser));
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      onLoginSuccess?.(oauthUser);
      window.history.replaceState(null, '', `${location.pathname}${location.search}`);
      navigate(params.get('returnTo') || '/', { replace: true });
    } catch {
      setError('Connexion Google impossible a finaliser.');
    }
  }, [location.pathname, location.search, navigate, onLoginSuccess]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const endpoint = isLogin ? 'login' : 'register';

    try {
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            firstname: formData.firstname,
            lastname: formData.lastname,
            email: formData.email,
            password: formData.password,
          };

      if (isLogin) {
        const data = await apiFetch<LoginResponse>(`${API_URL}/auth/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('token', data.token);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        onLoginSuccess?.(data.user);
        const from = getInternalReturnTo((location.state as LocationState | null)?.from);
        navigate(from, { replace: true });
      } else {
        await apiFetch<RegisterResponse>(`${API_URL}/auth/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setIsLogin(true);
        setError('Inscription réussie. Tu peux maintenant te connecter.');
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Une erreur est survenue.');
      if (apiErr.details && typeof apiErr.details === 'object') {
        setFieldErrors(apiErr.details as Record<string, string>);
      }
    }
  };

  const handleGoogleLogin = (): void => {
    setGoogleLoading(true);
    setError('');
    const from = getInternalReturnTo((location.state as LocationState | null)?.from);
    window.location.assign(`${API_URL}/auth/google?returnTo=${encodeURIComponent(from)}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 ref={headingRef} tabIndex={-1} className="auth-title">
          {isLogin ? 'Connexion' : 'Rejoindre Oncarya'}
        </h1>
        <p className="auth-subtitle">Soutien et partage pour tous.</p>
        {error && (
          <p className="auth-error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}
        <button
          type="button"
          className="google-auth-button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
        >
          <span className="google-mark" aria-hidden="true">G</span>
          <span>{googleLoading ? 'Ouverture de Google...' : 'Continuer avec Google'}</span>
        </button>
        <p className="auth-oauth-copy">Connexion rapide, sans publication automatique.</p>
        <div className="auth-divider" aria-hidden="true">
          <span />
          <strong>ou</strong>
          <span />
        </div>
        <form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="firstname">Prénom</label>
                <input
                  id="firstname"
                  type="text"
                  name="firstname"
                  className="form-input"
                  onChange={handleChange}
                  required
                />
                {fieldErrors.firstname && <small className="auth-error">{fieldErrors.firstname}</small>}
              </div>
              <div className="form-group">
                <label htmlFor="lastname">Nom</label>
                <input
                  id="lastname"
                  type="text"
                  name="lastname"
                  className="form-input"
                  onChange={handleChange}
                  required
                />
                {fieldErrors.lastname && <small className="auth-error">{fieldErrors.lastname}</small>}
              </div>
            </>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              onChange={handleChange}
              required
            />
            {fieldErrors.email && <small className="auth-error">{fieldErrors.email}</small>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              placeholder="Au moins 10 caractères"
              onChange={handleChange}
              required
              minLength={10}
            />
            {fieldErrors.password && <small className="auth-error">{fieldErrors.password}</small>}
          </div>
          <SquareButton type="submit" className="sqr-button-dark-background sqr-btn-primary">
            {isLogin ? 'Se connecter' : "S'inscrire"}
          </SquareButton>
        </form>
        <p className="toggle-text">
          {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
          <button type="button" className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Créer un compte' : 'Se connecter'}
          </button>
        </p>
      </div>
    </div>
  );
}
