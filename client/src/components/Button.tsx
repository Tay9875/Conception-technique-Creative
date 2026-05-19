import { ButtonHTMLAttributes, ReactNode } from 'react';
import '../styles/Button.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  ariaLabel?: string;
  role?: ButtonHTMLAttributes<HTMLButtonElement>['role'];
  'aria-checked'?: boolean;
  'aria-current'?: ButtonHTMLAttributes<HTMLButtonElement>['aria-current'];
  'aria-pressed'?: boolean;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-haspopup'?: ButtonHTMLAttributes<HTMLButtonElement>['aria-haspopup'];
  'aria-label'?: string;
};

const Button = ({
  children,
  type = 'button',
  className = '',
  disabled = false,
  ariaLabel,
  'aria-label': ariaLabelHtml,
  ...rest
}: ButtonProps) => {
  const resolvedAriaLabel = ariaLabelHtml ?? (ariaLabel && typeof children !== 'string' ? ariaLabel : undefined);

  return (
    <button
      type={type}
      className={`btn ${className}`}
      disabled={disabled}
      aria-label={resolvedAriaLabel}
      {...rest}
    >
      {children}
    </button>
  );
};

export { Button };
