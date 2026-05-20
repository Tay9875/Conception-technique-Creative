import { FormEvent, useState } from 'react';
import { SquareButton } from './SquareButton';
import '../styles/ProfileForm.css';
import type { ProfileStatus } from '../types';

const PROFILE_STATUS_OPTIONS: Array<{ value: ProfileStatus; label: string }> = [
  { value: 'patient', label: 'Patient' },
  { value: 'former_patient', label: 'Ancien patient' },
  { value: 'caregiver', label: 'Proche ou aidant' },
  { value: 'prefer_not_to_say', label: 'Je préfère ne pas préciser' },
];

interface ProfileFormProps {
  initialData: {
    firstname: string;
    lastname: string;
    email: string;
    profileStatus: ProfileStatus;
  };
  canChangePassword?: boolean;
  isSaving?: boolean;
  onSubmit: (data: {
    firstname: string;
    lastname: string;
    email: string;
    profileStatus: ProfileStatus;
    currentPassword?: string;
    newPassword?: string;
  }) => void;
}

export default function ProfileForm({
  initialData,
  canChangePassword = true,
  isSaving = false,
  onSubmit,
}: ProfileFormProps) {
  const [firstname, setFirstname] = useState(initialData.firstname);
  const [lastname, setLastname] = useState(initialData.lastname);
  const [email, setEmail] = useState(initialData.email);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>(initialData.profileStatus);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();

    onSubmit({
      firstname,
      lastname,
      email,
      profileStatus,
      ...(newPassword ? { currentPassword, newPassword } : {}),
    });
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-field">
        <label htmlFor="firstname">Prénom</label>
        <input
          id="firstname"
          type="text"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
          aria-required="true"
          className="textInput"
          placeholder="Ex : Thomas"
        />
      </div>

      <div className="profile-field">
        <label htmlFor="lastname">Nom</label>
        <input
          id="lastname"
          type="text"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
          aria-required="true"
          className="textInput"
          placeholder="Ex : Dubois"
        />
      </div>

      <div className="profile-field">
        <label htmlFor="email">Adresse email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-required="true"
          className="textInput"
          placeholder="nom@exemple.com"
        />
      </div>

      <div className="profile-field">
        <label htmlFor="profileStatus">Statut dans Oncarya</label>
        <select
          id="profileStatus"
          value={profileStatus}
          onChange={(e) => setProfileStatus(e.target.value as ProfileStatus)}
          className="textInput"
          aria-describedby="profile-status-help"
        >
          {PROFILE_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p id="profile-status-help" className="profile-helper">
          Cette information reste générale et peut rester vague.
        </p>
      </div>

      <section className="profile-password-section" aria-labelledby="profile-password-title">
        <h2 id="profile-password-title">Mot de passe</h2>
        {canChangePassword ? (
          <>
            <div className="profile-field">
              <label htmlFor="currentPassword">
                Mot de passe actuel
                <span className="sr-only"> (requis pour changer le mot de passe)</span>
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="textInput"
                autoComplete="current-password"
              />
            </div>
            <div className="profile-field">
              <label htmlFor="newPassword">
                Nouveau mot de passe
                <span className="sr-only"> (optionnel)</span>
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="textInput"
                placeholder="Au moins 10 caractères"
                minLength={10}
                autoComplete="new-password"
                aria-describedby="password-help"
              />
              <p id="password-help" className="profile-helper">
                Laissez vide pour conserver votre mot de passe actuel.
              </p>
            </div>
          </>
        ) : (
          <p className="profile-auth-note">
            Votre compte est connecté avec Google. Le changement de mot de passe Oncarya n’est pas disponible.
          </p>
        )}
      </section>

      <SquareButton
        type="submit"
        className="sqr-button-dark-background btn-option"
        aria-label="Enregistrer les modifications du profil"
        disabled={isSaving}
      >
        {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </SquareButton>
    </form>
  );
}
