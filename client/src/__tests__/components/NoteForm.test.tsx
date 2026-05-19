import { render, screen, fireEvent } from '@testing-library/react';
import NoteForm from '../../components/NoteForm';

describe('NoteForm', () => {
  it('renders the titre and contenu fields', () => {
    render(<NoteForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/Titre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contenu$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument();
  });

  it('calls onSubmit with both values when submitted', () => {
    const onSubmit = vi.fn();
    render(<NoteForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Titre$/i), {
      target: { value: 'Ma note' },
    });
    fireEvent.change(screen.getByLabelText(/Contenu$/i), {
      target: { value: 'Le contenu de ma note' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      titre: 'Ma note',
      contenu: 'Le contenu de ma note',
    });
  });

  it('does not submit when either field is empty', () => {
    const onSubmit = vi.fn();
    const { container } = render(<NoteForm onSubmit={onSubmit} />);
    const form = container.querySelector('form');
    fireEvent.submit(form!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('resets fields after a successful submit', () => {
    const onSubmit = vi.fn();
    render(<NoteForm onSubmit={onSubmit} />);

    const titre = screen.getByLabelText(/Titre$/i) as HTMLInputElement;
    const contenu = screen.getByLabelText(/Contenu$/i) as HTMLTextAreaElement;

    fireEvent.change(titre, { target: { value: 'T' } });
    fireEvent.change(contenu, { target: { value: 'C' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));

    expect(titre.value).toBe('');
    expect(contenu.value).toBe('');
  });
});
