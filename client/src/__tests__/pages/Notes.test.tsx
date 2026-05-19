import { screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from "jest-axe";
import Notes from '../../Notes';
import { renderWithProviders } from '../../test-utils/helpers/renderWithProviders';

const axeOptions = {
  rules: {
    'landmark-unique': { enabled: false },
    'heading-order': { enabled: false },
  },
} as const;

describe('Notes page', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    // Remove any modal root portal between tests
    const root = document.getElementById('modal-root');
    if (root && root.parentNode) {
      root.parentNode.removeChild(root);
    }
  });

  it('renders the heading and "Nouvelle note" button', () => {
    renderWithProviders(<Notes />, { initialEntries: ['/notes'] });

    expect(
      screen.getByRole('heading', { level: 1, name: /mes notes personnelles/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /créer une nouvelle note/i })
    ).toBeInTheDocument();
  });

  it('opens the modal when clicking "Nouvelle note" and closes it on submit', async () => {
    renderWithProviders(<Notes />, { initialEntries: ['/notes'] });

    fireEvent.click(
      screen.getByRole('button', { name: /créer une nouvelle note/i })
    );

    // Modal should now be open
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Fill the note form
    fireEvent.change(screen.getByLabelText(/^titre$/i), {
      target: { value: 'Ma note' },
    });
    fireEvent.change(screen.getByLabelText(/^contenu$/i), {
      target: { value: 'Le contenu de la note.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /enregistrer la note/i }));

    // Modal should close after submission
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(<Notes />, {
      initialEntries: ['/notes'],
    });
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
