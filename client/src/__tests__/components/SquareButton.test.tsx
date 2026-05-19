import { render, screen, fireEvent } from '@testing-library/react';
import { SquareButton } from '../../components/SquareButton';

describe('SquareButton', () => {
  it('renders children', () => {
    render(<SquareButton>Save</SquareButton>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(<SquareButton onClick={onClick}>Go</SquareButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <SquareButton onClick={onClick} disabled>
        Off
      </SquareButton>
    );
    const btn = screen.getByRole('button', { name: 'Off' });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('respects the type prop', () => {
    render(<SquareButton type="submit">Send</SquareButton>);
    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('type', 'submit');
  });

  it('uses ariaLabel when children is not a string', () => {
    render(
      <SquareButton ariaLabel="Delete item">
        <span aria-hidden="true">x</span>
      </SquareButton>
    );
    expect(screen.getByRole('button', { name: 'Delete item' })).toBeInTheDocument();
  });
});
