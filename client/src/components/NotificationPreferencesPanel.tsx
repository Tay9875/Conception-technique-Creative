import { ChangeEvent, useEffect, useState } from 'react';
import '../styles/NotificationPreferencesPanel.css';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '../lib/notifications';
import type { NotificationPreferencePatch, NotificationPreferences } from '../types';

type ChannelMode = 'both' | 'in_app' | 'email' | 'disabled';

const typeOptions: Array<{
  key: keyof Pick<
    NotificationPreferences,
    'comments_enabled' | 'reactions_enabled' | 'support_enabled' | 'moderation_enabled' | 'system_enabled'
  >;
  label: string;
}> = [
  { key: 'comments_enabled', label: 'Commentaires' },
  { key: 'reactions_enabled', label: 'Reactions utiles' },
  { key: 'support_enabled', label: 'Soutien' },
  { key: 'moderation_enabled', label: 'Verification de contenu' },
  { key: 'system_enabled', label: 'Informations importantes' },
];

const channelModeFromPreferences = (preferences: NotificationPreferences): ChannelMode => {
  if (preferences.in_app_enabled && preferences.email_enabled) return 'both';
  if (preferences.in_app_enabled) return 'in_app';
  if (preferences.email_enabled) return 'email';
  return 'disabled';
};

const patchFromChannelMode = (mode: ChannelMode): NotificationPreferencePatch => ({
  in_app_enabled: mode === 'both' || mode === 'in_app',
  email_enabled: mode === 'both' || mode === 'email',
});

export function NotificationPreferencesPanel() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const loadPreferences = async () => {
    setLoading(true);
    setError('');
    try {
      setPreferences(await fetchNotificationPreferences());
    } catch {
      setError('Preferences indisponibles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const savePatch = async (patch: NotificationPreferencePatch) => {
    setSaving(true);
    setStatus('');
    setError('');
    try {
      const updated = await updateNotificationPreferences(patch);
      setPreferences(updated);
      setStatus('Preferences mises a jour.');
    } catch {
      setError('Impossible de sauvegarder vos preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleModeChange = (event: ChangeEvent<HTMLInputElement>) => {
    savePatch(patchFromChannelMode(event.target.value as ChannelMode));
  };

  const handleTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    savePatch({ [event.target.name]: event.target.checked } as NotificationPreferencePatch);
  };

  if (loading) {
    return (
      <section className="notification-preferences" aria-labelledby="notification-preferences-title">
        <h2 id="notification-preferences-title">Notifications</h2>
        <p className="notification-preferences-muted">Chargement des preferences...</p>
      </section>
    );
  }

  if (!preferences) {
    return (
      <section className="notification-preferences" aria-labelledby="notification-preferences-title">
        <h2 id="notification-preferences-title">Notifications</h2>
        <p className="notification-preferences-error" role="alert">{error}</p>
        <button type="button" className="notification-preferences-retry" onClick={loadPreferences}>
          Reessayer
        </button>
      </section>
    );
  }

  const mode = channelModeFromPreferences(preferences);

  return (
    <section className="notification-preferences" aria-labelledby="notification-preferences-title">
      <div className="notification-preferences-heading">
        <div>
          <h2 id="notification-preferences-title">Notifications</h2>
          <p>Choisissez comment Oncarya vous previent, sans contenu sensible dans les emails.</p>
        </div>
        {saving && <span className="notification-saving">Enregistrement...</span>}
      </div>

      {error && <p className="notification-preferences-error" role="alert">{error}</p>}
      {status && <p className="notification-preferences-status" role="status">{status}</p>}

      <fieldset className="notification-fieldset">
        <legend>Canal</legend>
        <label>
          <input type="radio" name="notification-channel" value="both" checked={mode === 'both'} onChange={handleModeChange} />
          Navigateur et email
        </label>
        <label>
          <input type="radio" name="notification-channel" value="in_app" checked={mode === 'in_app'} onChange={handleModeChange} />
          Navigateur uniquement
        </label>
        <label>
          <input type="radio" name="notification-channel" value="email" checked={mode === 'email'} onChange={handleModeChange} />
          Email uniquement
        </label>
        <label>
          <input type="radio" name="notification-channel" value="disabled" checked={mode === 'disabled'} onChange={handleModeChange} />
          Desactive
        </label>
      </fieldset>

      <fieldset className="notification-fieldset compact">
        <legend>Types de notifications</legend>
        {typeOptions.map((option) => (
          <label key={option.key}>
            <input
              type="checkbox"
              name={option.key}
              checked={Boolean(preferences[option.key])}
              onChange={handleTypeChange}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    </section>
  );
}
