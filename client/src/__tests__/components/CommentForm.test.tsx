import { render, screen, fireEvent } from '@testing-library/react';
import CommentForm from '../../components/CommentForm';

describe('CommentForm', () => {
  it('renders the contenu textarea', () => {
    render(<CommentForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/Commentaires/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument();
  });

  it('calls onSubmit with the typed contenu and empty titre', () => {
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Commentaires/i), {
      target: { value: 'Super article !' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ titre: '', contenu: 'Super article !' });
  });

  it('does not call onSubmit when the textarea is empty', () => {
    const onSubmit = vi.fn();
    const { container } = render(<CommentForm onSubmit={onSubmit} />);

    const form = container.querySelector('form');
    fireEvent.submit(form!);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears the textarea after a successful submit', () => {
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} />);

    const textarea = screen.getByLabelText(/Commentaires/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Très utile' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));

    expect(textarea.value).toBe('');
  });
});
