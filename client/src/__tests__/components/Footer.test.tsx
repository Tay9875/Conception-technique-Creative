import { render, screen } from '@testing-library/react';
import { Footer } from '../../components/Footer';

describe('Footer', () => {
  it('renders as a contentinfo landmark', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the heading text', () => {
    render(<Footer />);
    expect(
      screen.getByRole('heading', { name: /Ensemble & Fort.*Un espace de partage et d'entraide/i })
    ).toBeInTheDocument();
  });

  it('renders the descriptive disclaimer text', () => {
    render(<Footer />);
    expect(
      screen.getByText(/Ce blog est un espace de soutien communautaire/i)
    ).toBeInTheDocument();
  });
});
