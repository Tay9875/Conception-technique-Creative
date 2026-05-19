import { render, screen, fireEvent } from '@testing-library/react';
import { Container } from '../../components/Container';
import { mockTags } from '../../test-utils/helpers/fixtures';

describe('Container', () => {
  it('renders children inside the main landmark', () => {
    render(
      <Container>
        <p>Inner content</p>
      </Container>
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Inner content')).toBeInTheDocument();
  });

  it('does not render filters when no callbacks are provided', () => {
    render(
      <Container tags={mockTags}>
        <p>Content</p>
      </Container>
    );
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByText('Trier par :')).not.toBeInTheDocument();
  });

  it('renders the tag radio group when onTagChange is provided', () => {
    render(
      <Container tags={mockTags} onTagChange={vi.fn()} onSortChange={vi.fn()}>
        <p>Content</p>
      </Container>
    );
    expect(screen.getByRole('radiogroup', { name: 'Catégories' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Tous/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Bien-être/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Sein/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Poumon/i })).toBeInTheDocument();
  });

  it('calls onTagChange when a tag radio is clicked', () => {
    const onTagChange = vi.fn();
    render(
      <Container tags={mockTags} onTagChange={onTagChange} onSortChange={vi.fn()}>
        <p>Content</p>
      </Container>
    );
    fireEvent.click(screen.getByRole('radio', { name: /Bien-être/i }));
    expect(onTagChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole('radio', { name: /Tous/i }));
    expect(onTagChange).toHaveBeenCalledWith(null);
  });

  it('renders sort radios and calls onSortChange when clicked', () => {
    const onSortChange = vi.fn();
    render(
      <Container onSortChange={onSortChange} onTagChange={vi.fn()}>
        <p>Content</p>
      </Container>
    );
    expect(screen.getByText(/Trier par/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Populaires/i }));
    expect(onSortChange).toHaveBeenCalledWith('Populaires');

    fireEvent.click(screen.getByRole('radio', { name: /Récents/i }));
    expect(onSortChange).toHaveBeenCalledWith('Récents');
  });
});
