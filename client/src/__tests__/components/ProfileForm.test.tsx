import { render, screen, fireEvent } from '@testing-library/react';
import ProfileForm from '../../components/ProfileForm';

const initialData = {
  firstname: 'Alice',
  lastname: 'Martin',
  email: 'alice@example.com',
  profileStatus: 'patient' as const,
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
    expect(screen.getByLabelText(/Statut dans Oncarya/i)).toHaveValue('patient');
  });

  it('omits password fields from the payload when left empty', () => {
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
      profileStatus: 'patient',
    });
    expect('currentPassword' in payload).toBe(false);
    expect('newPassword' in payload).toBe(false);
  });

  it('includes password fields in the payload when filled in', () => {
    const onSubmit = vi.fn();
    render(<ProfileForm initialData={initialData} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Mot de passe actuel/i), {
      target: { value: 'oldpass123' },
    });
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
      profileStatus: 'patient',
      currentPassword: 'oldpass123',
      newPassword: 'newpass123',
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

  it('hides password inputs for Google-only accounts', () => {
    render(<ProfileForm initialData={initialData} canChangePassword={false} onSubmit={vi.fn()} />);

    expect(screen.queryByLabelText(/Nouveau mot de passe/i)).not.toBeInTheDocument();
    expect(screen.getByText(/connecté avec Google/i)).toBeInTheDocument();
  });

  it('submits profile status changes', () => {
    const onSubmit = vi.fn();
    render(<ProfileForm initialData={initialData} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Statut dans Oncarya/i), {
      target: { value: 'caregiver' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /Enregistrer les modifications/i })
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ profileStatus: 'caregiver' })
    );
  });
});
