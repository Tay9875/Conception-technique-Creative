import { render, screen } from '@testing-library/react';
import { NoteCard } from '../../components/NoteCard';

describe('NoteCard', () => {
  const props = {
    id: '42',
    title: 'Ma note',
    content: 'Contenu de la note',
    date: '15/01/2026',
  };

  it('renders the title', () => {
    render(<NoteCard {...props} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Ma note' })).toBeInTheDocument();
  });

  it('renders the content', () => {
    render(<NoteCard {...props} />);
    expect(screen.getByText('Contenu de la note')).toBeInTheDocument();
  });

  it('renders the date', () => {
    render(<NoteCard {...props} />);
    expect(screen.getByText(/15\/01\/2026/)).toBeInTheDocument();
  });

  it('exposes an edit button with aria-label referencing the title', () => {
    render(<NoteCard {...props} />);
    expect(
      screen.getByRole('button', { name: 'Modifier la note "Ma note"' })
    ).toBeInTheDocument();
  });

  it('exposes a delete button with aria-label referencing the title', () => {
    render(<NoteCard {...props} />);
    expect(
      screen.getByRole('button', { name: 'Supprimer la note "Ma note"' })
    ).toBeInTheDocument();
  });
});
