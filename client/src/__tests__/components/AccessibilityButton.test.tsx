import { screen, fireEvent } from '@testing-library/react';
import AccessibilityButton from '../../components/AccessibilityButton';
import { renderWithProviders } from '../../test-utils/helpers/renderWithProviders';

describe('AccessibilityButton', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
  });

  it('renders the toggle button', () => {
    renderWithProviders(<AccessibilityButton />);
    expect(
      screen.getByRole('button', { name: "Ouvrir le panneau d'accessibilité" })
    ).toBeInTheDocument();
  });

  it('opens the panel when the toggle is clicked', () => {
    renderWithProviders(<AccessibilityButton />);
    const toggle = screen.getByRole('button', { name: "Ouvrir le panneau d'accessibilité" });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the panel when the toggle is clicked again', () => {
    renderWithProviders(<AccessibilityButton />);
    const toggle = screen.getByRole('button', { name: "Ouvrir le panneau d'accessibilité" });
    fireEvent.click(toggle);
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('increases and decreases font size via the +/- buttons', () => {
    renderWithProviders(<AccessibilityButton />);
    fireEvent.click(screen.getByRole('button', { name: "Ouvrir le panneau d'accessibilité" }));
    expect(screen.getByText('16px')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Augmenter la taille du texte' }));
    expect(screen.getByText('18px')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Diminuer la taille du texte' }));
    expect(screen.getByText('16px')).toBeInTheDocument();
  });

  it('toggles the dyslexic font checkbox', () => {
    renderWithProviders(<AccessibilityButton />);
    fireEvent.click(screen.getByRole('button', { name: "Ouvrir le panneau d'accessibilité" }));
    const checkbox = screen.getByLabelText('Police adaptée (dyslexie)') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(document.body.classList.contains('dyslexic-font')).toBe(true);
  });

  it('closes the panel when Escape is pressed', () => {
    renderWithProviders(<AccessibilityButton />);
    fireEvent.click(screen.getByRole('button', { name: "Ouvrir le panneau d'accessibilité" }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
