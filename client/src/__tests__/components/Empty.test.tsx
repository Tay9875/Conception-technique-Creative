import { render, screen } from '@testing-library/react';
import { Empty } from '../../components/Empty';

describe('Empty', () => {
  it('renders its children', () => {
    render(
      <Empty>
        <p>No data here</p>
      </Empty>
    );
    expect(screen.getByText('No data here')).toBeInTheDocument();
  });

  it('uses the default aria-label when none is provided', () => {
    render(
      <Empty>
        <p>Empty content</p>
      </Empty>
    );
    expect(
      screen.getByRole('region', { name: 'Aucun article disponible' })
    ).toBeInTheDocument();
  });

  it('accepts a custom aria-label', () => {
    render(
      <Empty aria-label="Aucune note">
        <p>Empty</p>
      </Empty>
    );
    expect(screen.getByRole('region', { name: 'Aucune note' })).toBeInTheDocument();
  });
});
