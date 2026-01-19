import React from "react";
import "../styles/Button.css";

const Button = ({
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
      className={`btn ${className}`}
      disabled={disabled}
      aria-label={ariaLabel} // utile si le texte n'est pas explicite
    >
      {children}
    </button>
  );
};

export { Button };