import { render, screen, fireEvent } from '@testing-library/react';
import AccessibleModal from '../../components/AccessibleModal';

describe('AccessibleModal', () => {
  afterEach(() => {
    document.body.style.overflow = 'auto';
    document.getElementById('modal-root')?.remove();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AccessibleModal isOpen={false} onClose={vi.fn()} title="Hidden">
        <p>Body content</p>
      </AccessibleModal>
    );
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(screen.queryByText('Body content')).not.toBeInTheDocument();
  });

  it('renders the title and children inside a portal when open', () => {
    render(
      <AccessibleModal isOpen onClose={vi.fn()} title="My modal">
        <p>Body content</p>
      </AccessibleModal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'My modal' })).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(document.getElementById('modal-root')).not.toBeNull();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <AccessibleModal isOpen onClose={onClose} title="Esc">
        <button type="button">Inside</button>
      </AccessibleModal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('focuses the first focusable element when opened', () => {
    render(
      <AccessibleModal isOpen onClose={vi.fn()} title="Focus">
        <button type="button">Inside button</button>
      </AccessibleModal>
    );
    const closeButton = screen.getByRole('button', { name: 'Fermer - Focus' });
    expect(document.activeElement).toBe(closeButton);
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <AccessibleModal isOpen onClose={onClose} title="Click close">
        <p>Body</p>
      </AccessibleModal>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fermer - Click close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

