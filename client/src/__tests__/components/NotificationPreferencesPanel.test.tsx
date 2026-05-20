import { fireEvent, screen, waitFor } from '@testing-library/react';
import { NotificationPreferencesPanel } from '../../components/NotificationPreferencesPanel';
import { renderWithProviders } from '../../test-utils/helpers/renderWithProviders';

describe('NotificationPreferencesPanel', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'access.token.value');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('loads and updates notification channel preferences', async () => {
    renderWithProviders(<NotificationPreferencesPanel />);

    const emailOnly = await screen.findByLabelText(/email uniquement/i);
    fireEvent.click(emailOnly);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/preferences mises a jour/i);
    });
  });

  it('renders granular type checkboxes', async () => {
    renderWithProviders(<NotificationPreferencesPanel />);

    expect(await screen.findByLabelText(/commentaires/i)).toBeChecked();
    expect(screen.getByLabelText(/informations importantes/i)).toBeChecked();
  });
});
