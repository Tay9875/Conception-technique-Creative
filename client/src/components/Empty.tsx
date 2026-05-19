import { ReactNode } from "react";
import "../styles/Empty.css";


interface ContainerProps {
  children: ReactNode;
}

export const Empty: React.FC<ContainerProps> = ({ children }) => {
  return (
    <main className="empty-state" aria-label="Aucun article disponible" id="main-content">
        {children}
    </main>
  );
};
