import React from "react";
import "../styles/SquareButton.css";

type SquareButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  ariaLabel?: string;
};

const SquareButton: React.FC<SquareButtonProps> = ({
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
      className={`sqr-button ${className}`}
      disabled={disabled}
      aria-label={resolvedAriaLabel}
      {...rest}
    >
      {children}
    </button>
  );
};

export { SquareButton };
