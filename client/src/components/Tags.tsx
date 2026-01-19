import { FunctionComponent, ReactNode } from "react";
import "../styles/Tags.css";

interface TagProps {
  children: ReactNode;
}

export const Tag: FunctionComponent<TagProps> = ({ children }) => {
  return (
    <span className="tag">
      {children}
    </span>
  );
};
