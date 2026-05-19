import { render, screen, fireEvent } from '@testing-library/react';
import FeedForm from '../../components/FeedForm';
import { mockTags } from '../../test-utils/helpers/fixtures';

describe('FeedForm', () => {
  it('renders title, description, and select inputs with tag options', () => {
    const onSubmit = vi.fn();
    render(<FeedForm tags={mockTags} onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/Titre de l/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    const select = screen.getByLabelText(/Catégorie/i);
    expect(select).toBeInTheDocument();
    mockTags.forEach((t) => {
      expect(screen.getByRole('option', { name: t.title })).toBeInTheDocument();
    });
  });

  it('does not call onSubmit when title and description are empty', () => {
    const onSubmit = vi.fn();
    const { container } = render(<FeedForm tags={mockTags} onSubmit={onSubmit} />);

    // Bypass HTML5 validation by submitting the form element directly.
    const form = container.querySelector('form');
    fireEvent.submit(form!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the typed values with tag_id as a number', () => {
    const onSubmit = vi.fn();
    render(<FeedForm tags={mockTags} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Titre de l/i), {
      target: { value: 'Mon article' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Une description.' },
    });
    fireEvent.change(screen.getByLabelText(/Catégorie/i), {
      target: { value: String(mockTags[1].id) },
    });

    fireEvent.click(screen.getByRole('button', { name: /Publier/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Mon article',
      description: 'Une description.',
      tag_id: mockTags[1].id,
    });
    expect(typeof onSubmit.mock.calls[0][0].tag_id).toBe('number');
  });

  it('resets fields after a successful submit', () => {
    const onSubmit = vi.fn();
    render(<FeedForm tags={mockTags} onSubmit={onSubmit} />);

    const titleInput = screen.getByLabelText(/Titre de l/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    const select = screen.getByLabelText(/Catégorie/i) as HTMLSelectElement;

    fireEvent.change(titleInput, { target: { value: 'Titre' } });
    fireEvent.change(descInput, { target: { value: 'Desc' } });
    fireEvent.change(select, { target: { value: String(mockTags[2].id) } });

    fireEvent.click(screen.getByRole('button', { name: /Publier/i }));

    expect(titleInput.value).toBe('');
    expect(descInput.value).toBe('');
    // tag resets to the first tag id
    expect(select.value).toBe(String(mockTags[0].id));
  });
});
