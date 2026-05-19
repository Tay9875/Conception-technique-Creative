import React from "react";
import "../styles/Button.css";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  ariaLabel?: string;
};

const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  className = "",
  disabled = false,
  ariaLabel,
  "aria-label": ariaLabelHtml,
  ...rest
}) => {
  const resolvedAriaLabel = ariaLabelHtml ?? (ariaLabel && typeof children !== "string" ? ariaLabel : undefined);

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
