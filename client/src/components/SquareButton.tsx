import React from "react";
import "../styles/SquareButton.css";

type SquareButtonProps = {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

const SquareButton: React.FC<SquareButtonProps> = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  ariaLabel,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`sqr-button ${className}`}
      disabled={disabled}
      aria-label={
        ariaLabel && typeof children !== "string"
          ? ariaLabel
          : undefined
      }
    >
      {children}
    </button>
  );
};

export { SquareButton };
