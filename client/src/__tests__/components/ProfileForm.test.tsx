import { render, screen, fireEvent } from '@testing-library/react';
import ProfileForm from '../../components/ProfileForm';

const initialData = {
  firstname: 'Alice',
  lastname: 'Martin',
  email: 'alice@example.com',
};

describe('ProfileForm', () => {
  it('pre-fills the inputs from initialData', () => {
    render(<ProfileForm initialData={initialData} onSubmit={vi.fn()} />);

    expect((screen.getByLabelText(/Prénom/i) as HTMLInputElement).value).toBe(
      'Alice'
    );
    expect((screen.getByLabelText(/^Nom$/i) as HTMLInputElement).value).toBe(
      'Martin'
    );
    expect((screen.getByLabelText(/Adresse email/i) as HTMLInputElement).value).toBe(
      'alice@example.com'
    );
    expect(
      (screen.getByLabelText(/Nouveau mot de passe/i) as HTMLInputElement).value
    ).toBe('');
  });

  it('omits password from the payload when left empty', () => {
    const onSubmit = vi.fn();
    render(<ProfileForm initialData={initialData} onSubmit={onSubmit} />);

    fireEvent.click(
      screen.getByRole('button', { name: /Enregistrer les modifications/i })
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).toEqual({
      firstname: 'Alice',
      lastname: 'Martin',
      email: 'alice@example.com',
    });
    expect('password' in payload).toBe(false);
  });

  it('includes password in the payload when filled in', () => {
    const onSubmit = vi.fn();
    render(<ProfileForm initialData={initialData} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Nouveau mot de passe/i), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /Enregistrer les modifications/i })
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      firstname: 'Alice',
      lastname: 'Martin',
      email: 'alice@example.com',
      password: 'newpass123',
    });
  });

  it('reflects edits to the inputs in the submitted payload', () => {
    const onSubmit = vi.fn();
    render(<ProfileForm initialData={initialData} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Prénom/i), {
      target: { value: 'Alicia' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /Enregistrer les modifications/i })
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ firstname: 'Alicia' })
    );
  });
});
