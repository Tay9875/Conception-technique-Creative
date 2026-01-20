import { ReactNode } from "react";
import { Square } from "lucide-react";
import "../styles/Empty.css";
import { SquareButton } from "./SquareButton.tsx";


interface ContainerProps {
  children: ReactNode;
}

export const Empty: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="empty-state" aria-label="Aucun article disponible">
        {children}
    </div>
  );
};
