import React from "react";
import "../styles/SquareButton.css";

const SquareButton = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`sqr-button ${className}`}
      disabled={disabled}
      aria-label={ariaLabel} // utile si le texte n'est pas explicite
    >
      {children}
    </button>
  );
};

export { SquareButton };
