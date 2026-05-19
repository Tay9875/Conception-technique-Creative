import { render, screen, fireEvent } from '@testing-library/react';
import ReportForm from '../../components/ReportForm';

describe('ReportForm', () => {
  it('renders both Annuler and Signaler buttons', () => {
    render(<ReportForm onCancel={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Annuler le signalement' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmer le signalement' })).toBeInTheDocument();
  });

  it('calls onCancel when "Annuler" is clicked', () => {
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    render(<ReportForm onCancel={onCancel} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Annuler le signalement' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit when the form is submitted', () => {
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    render(<ReportForm onCancel={onCancel} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer le signalement' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('renders the explanatory warning text', () => {
    render(<ReportForm onCancel={vi.fn()} onSubmit={vi.fn()} />);
    expect(
      screen.getByText(/Vous êtes sur le point de signaler ce contenu/i)
    ).toBeInTheDocument();
  });
});
