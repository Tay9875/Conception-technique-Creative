import { ReactNode } from "react";
import { Square } from "lucide-react";
import "../styles/Empty.css";
import { SquareButton } from "./SquareButton.tsx";


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
