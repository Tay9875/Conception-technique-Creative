import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { Header } from './components/Header';
import { SquareButton } from './components/SquareButton';
import ProfileForm from './components/ProfileForm';
import { API_URL } from './config/api';
import type { SessionUser, User } from './types';

interface ProfileProps {
  onLogout?: () => void;
}

interface ProfileFormData {
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
}

type StoredUser = SessionUser & Partial<User>;

function readStoredUser(): StoredUser | null {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as StoredUser;
  } catch {
    return null;
  }
}

export default function Profile(_props: ProfileProps) {
  const navigate = useNavigate();

  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState<StoredUser | null>(() => readStoredUser());

  useEffect(() => {
    if (user && user.id && user.role_id === undefined) {
      fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
      })
        .then((res) => res.json())
        .then((data: { role_id?: number }) => {
          if (data && data.role_id) {
            const updatedUser: StoredUser = { ...user, role_id: data.role_id };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        })
        .catch((err) => console.error('Erreur récupération profil:', err));
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = (): void => {
    setUser(null);
    localStorage.removeItem('user');
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
  };

  const roleLabel =
    user.role_id === 1
      ? 'Patient'
      : user.role_id === 2
      ? 'Ancien Patient'
      : user.role_id === 3
      ? 'Proche'
      : 'Inconnu';

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <main className="profile-container" id="main-content">
        <section className="profile-card" aria-labelledby="profile-title">
          <div className="profile-header" aria-labelledby="profile-header">
            <span
              className="profile-icon material-symbols-outlined"
              aria-hidden="true"
            >
              account_circle
            </span>
            <p className="profile-subtitle">Modifiez vos informations personnelles</p>
            <p className="profile-status" style={{ marginTop: 8, fontWeight: 500 }}>
              Statut : {roleLabel}
            </p>
          </div>

          <div className="sign-out">
            <SquareButton className="sign-out-btn" onClick={handleLogout}>
              Déconnexion
            </SquareButton>
          </div>

          <ProfileForm
            initialData={initialData}
            onSubmit={(data) => {
              console.log('Profil mis à jour :', data);
            }}
          />
        </section>
      </main>
    </>
  );
}
