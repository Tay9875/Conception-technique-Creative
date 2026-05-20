import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { Header } from './components/Header';
import { SquareButton } from './components/SquareButton';
import ProfileForm from './components/ProfileForm';
import { NotificationPreferencesPanel } from './components/NotificationPreferencesPanel';
import { API_URL } from './config/api';
import { apiFetch, ApiError } from './lib/apiClient';
import type { ProfileStatus, SessionUser, UpdateProfilePayload, UpdateProfileResponse, User } from './types';

interface ProfileProps {
  onLogout?: () => void;
}

interface ProfileFormData {
  firstname: string;
  lastname: string;
  email: string;
  profileStatus: ProfileStatus;
}

type StoredUser = SessionUser & Partial<User>;

const PROFILE_STATUS_LABELS: Record<ProfileStatus, string> = {
  patient: 'Patient',
  former_patient: 'Ancien patient',
  caregiver: 'Proche ou aidant',
  prefer_not_to_say: 'Non précisé',
};

function readStoredUser(): StoredUser | null {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as StoredUser;
  } catch {
    return null;
  }
}

function profileStatusFromUser(user: StoredUser): ProfileStatus {
  if (user.profileStatus) return user.profileStatus;
  if (user.profile_status) return user.profile_status;
  if (user.role_id === 1) return 'patient';
  if (user.role_id === 2) return 'former_patient';
  if (user.role_id === 3) return 'caregiver';
  return 'prefer_not_to_say';
}

function authProvidersFromUser(user: StoredUser) {
  if (user.authProviders?.length) return user.authProviders;
  return user.hasPassword === false ? ['google' as const] : ['password' as const];
}

export default function Profile(_props: ProfileProps) {
  const navigate = useNavigate();

  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState<StoredUser | null>(() => readStoredUser());
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    apiFetch<SessionUser>(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
    })
      .then((data) => {
        const updatedUser: StoredUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      })
      .catch((err) => console.error('Erreur récupération profil:', err));
  }, [user?.id]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = (): void => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const initialData: ProfileFormData = {
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email ?? '',
    profileStatus: profileStatusFromUser(user),
  };

  const providers = authProvidersFromUser(user);
  const hasGoogleProvider = providers.includes('google');
  const hasPasswordProvider = providers.includes('password') || user.hasPassword === true;
  const canChangePassword = user.canChangePassword ?? hasPasswordProvider;
  const profileStatusLabel = PROFILE_STATUS_LABELS[initialData.profileStatus];

  const handleProfileSubmit = async (data: UpdateProfilePayload): Promise<void> => {
    setIsSaving(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const updatedUser = await apiFetch<UpdateProfileResponse>(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify(data),
      });
      const mergedUser: StoredUser = { ...user, ...updatedUser };
      setUser(mergedUser);
      localStorage.setItem('user', JSON.stringify(mergedUser));
      setStatusMessage('Profil mis à jour.');
    } catch (err) {
      const apiErr = err as ApiError;
      setErrorMessage(apiErr.message || 'Impossible de mettre à jour le profil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <main className="profile-container" id="main-content">
        <section className="profile-card" aria-labelledby="profile-title">
          <div className="profile-header" aria-labelledby="profile-title">
            <span className="profile-icon material-symbols-outlined" aria-hidden="true">
              account_circle
            </span>
            <h1 id="profile-title">Profil</h1>
            <p className="profile-subtitle">Modifiez vos informations personnelles</p>
            <p className="profile-status">Statut : {profileStatusLabel}</p>
          </div>

          <div className="sign-out">
            <SquareButton className="sign-out-btn" onClick={handleLogout}>
              Déconnexion
            </SquareButton>
          </div>

          <section className="profile-section" aria-labelledby="profile-auth-title">
            <h2 id="profile-auth-title">Méthode de connexion</h2>
            <div className="profile-provider-list" aria-label="Méthodes actives">
              {hasGoogleProvider && <span>Google</span>}
              {hasPasswordProvider && <span>Mot de passe Oncarya</span>}
            </div>
            <p>
              {hasGoogleProvider && !hasPasswordProvider
                ? 'Connexion via Google. Aucun mot de passe Oncarya n’est configuré.'
                : hasGoogleProvider
                  ? 'Google est lié à ce compte. Le mot de passe Oncarya reste disponible.'
                  : 'Connexion avec un email et un mot de passe Oncarya.'}
            </p>
          </section>

          {statusMessage && (
            <p className="profile-feedback success" role="status">
              {statusMessage}
            </p>
          )}
          {errorMessage && (
            <p className="profile-feedback error" role="alert">
              {errorMessage}
            </p>
          )}

          <ProfileForm
            initialData={initialData}
            canChangePassword={canChangePassword}
            isSaving={isSaving}
            onSubmit={handleProfileSubmit}
          />
        </section>
        <NotificationPreferencesPanel />
      </main>
    </>
  );
}
