import { ReactNode } from "react";
import "../styles/Empty.css";


interface ContainerProps {
  children: ReactNode;
}

export const Empty: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      {children}
    </div>
  );
};
