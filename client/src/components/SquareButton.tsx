import { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import '../styles/SquareButton.css';

interface SquareButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  role?: ButtonHTMLAttributes<HTMLButtonElement>['role'];
  'aria-checked'?: boolean;
  'aria-current'?: ButtonHTMLAttributes<HTMLButtonElement>['aria-current'];
  'aria-pressed'?: boolean;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-haspopup'?: ButtonHTMLAttributes<HTMLButtonElement>['aria-haspopup'];
  'aria-label'?: string;
}

const SquareButton = ({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  ariaLabel,
  ...rest
}: SquareButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`sqr-button ${className}`}
      disabled={disabled}
      aria-label={
        rest['aria-label'] ??
        (ariaLabel && typeof children !== 'string' ? ariaLabel : undefined)
      }
      role={rest.role}
      aria-checked={rest['aria-checked']}
      aria-current={rest['aria-current']}
      aria-pressed={rest['aria-pressed']}
      aria-expanded={rest['aria-expanded']}
      aria-controls={rest['aria-controls']}
      aria-haspopup={rest['aria-haspopup']}
    >
      {children}
    </button>
  );
};

export { SquareButton };
