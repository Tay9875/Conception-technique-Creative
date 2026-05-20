import { fireEvent, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { NotificationBell } from '../../components/NotificationBell';
import { renderWithProviders } from '../../test-utils/helpers/renderWithProviders';
import { mockSessionUser } from '../../test-utils/helpers/fixtures';

describe('NotificationBell', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'access.token.value');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('shows unread count and notification list', async () => {
    renderWithProviders(<NotificationBell user={mockSessionUser} />);

    const trigger = await screen.findByRole('button', { name: /notifications, 2 non lues/i });
    fireEvent.click(trigger);

    expect(await screen.findByRole('heading', { name: /notifications/i })).toBeInTheDocument();
    expect(await screen.findByText(/nouveau commentaire/i)).toBeInTheDocument();
  });

  it('marks all notifications as read', async () => {
    renderWithProviders(<NotificationBell user={mockSessionUser} />);

    fireEvent.click(await screen.findByRole('button', { name: /notifications, 2 non lues/i }));
    fireEvent.click(await screen.findByRole('button', { name: /tout lire/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^notifications$/i })).toBeInTheDocument();
    });
  });

  it('has no axe violations when closed', async () => {
    const { container } = renderWithProviders(<NotificationBell user={mockSessionUser} />);

    await screen.findByRole('button', { name: /notifications/i });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
